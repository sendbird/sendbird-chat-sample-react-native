import { useCallback } from 'react';
import { Poll } from '@sendbird/chat/poll';
import { useSendbirdChat } from '@sendbird/uikit-react-native';
import { useGroupChannel } from '@sendbird/uikit-chat-hooks';

export interface UsePollResult {
  votePoll: (pollId: number, optionIds: number[]) => Promise<void>;
  closePoll: (pollId: number) => Promise<void>;
  deletePoll: (pollId: number) => Promise<void>;
  updatePoll: (pollId: number, title?: string, data?: string) => Promise<void>;
  addPollOption: (pollId: number, optionText: string) => Promise<void>;
  loading: boolean;
}

export const usePoll = (channelUrl?: string): UsePollResult => {
  const { sdk } = useSendbirdChat();
  const { channel } = useGroupChannel(sdk, channelUrl || '');

  const votePoll = useCallback(async (pollId: number, optionIds: number[]) => {
    if (!channel) {
      throw new Error('Channel not found');
    }
    
    try {
      await channel.votePoll(pollId, optionIds);
    } catch (error) {
      console.error('Error voting on poll:', error);
      throw error;
    }
  }, [channel]);

  const closePoll = useCallback(async (pollId: number) => {
    if (!channel) {
      throw new Error('Channel not found');
    }
    
    try {
      await channel.closePoll(pollId);
    } catch (error) {
      console.error('Error closing poll:', error);
      throw error;
    }
  }, [channel]);

  const deletePoll = useCallback(async (pollId: number) => {
    if (!channel) {
      throw new Error('Channel not found');
    }
    
    try {
      await channel.deletePoll(pollId);
    } catch (error) {
      console.error('Error deleting poll:', error);
      throw error;
    }
  }, [channel]);

  const updatePoll = useCallback(async (pollId: number, title?: string, data?: string) => {
    if (!channel) {
      throw new Error('Channel not found');
    }
    
    try {
      const params: any = {};
      if (title !== undefined) params.title = title;
      if (data !== undefined) params.data = data;
      
      await channel.updatePoll(pollId, params);
    } catch (error) {
      console.error('Error updating poll:', error);
      throw error;
    }
  }, [channel]);

  const addPollOption = useCallback(async (pollId: number, optionText: string) => {
    if (!channel) {
      throw new Error('Channel not found');
    }
    
    try {
      await channel.addPollOption(pollId, optionText);
    } catch (error) {
      console.error('Error adding poll option:', error);
      throw error;
    }
  }, [channel]);

  return {
    votePoll,
    closePoll,
    deletePoll,
    updatePoll,
    addPollOption,
    loading: false, // TODO: Add loading state management
  };
};