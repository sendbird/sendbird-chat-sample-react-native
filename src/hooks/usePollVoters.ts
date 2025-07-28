import {useCallback, useEffect, useState} from 'react';
import {Poll, PollVoterListQuery} from '@sendbird/chat/poll';
import {User} from '@sendbird/chat';
import {useSendbirdChat} from '@sendbird/uikit-react-native';
import {useGroupChannel} from '@sendbird/uikit-chat-hooks';

export interface UsePollVotersResult {
  votersData: Record<number, User[]>;
  loading: boolean;
  error: string | null;
  refetchVoters: () => Promise<void>;
  getVotersForOption: (optionId: number) => User[];
}

export const usePollVoters = (poll: Poll, channelUrl?: string): UsePollVotersResult => {
  const { sdk } = useSendbirdChat();
  const { channel } = useGroupChannel(sdk, channelUrl || '');
  const [votersData, setVotersData] = useState<Record<number, User[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVoters = useCallback(async () => {
    if (!channel) return;

    setLoading(true);
    setError(null);
    const newVotersData: Record<number, User[]> = {};

    try {
      for (const option of poll.options) {
        const query: PollVoterListQuery = channel.createPollVoterListQuery(poll.id, option.id);
        newVotersData[option.id] = await query.next();
      }
      setVotersData(newVotersData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch poll voters';
      setError(errorMessage);
      console.error('Error fetching poll voters:', err);
    } finally {
      setLoading(false);
    }
  }, [channel, poll.id, poll.options]);

  const getVotersForOption = useCallback((optionId: number): User[] => {
    return votersData[optionId] || [];
  }, [votersData]);

  useEffect(() => {
    fetchVoters();
  }, [fetchVoters]);

  return {
    votersData,
    loading,
    error,
    refetchVoters: fetchVoters,
    getVotersForOption,
  };
};
