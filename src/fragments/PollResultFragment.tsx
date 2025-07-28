import React from 'react';
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Poll, PollOption} from '@sendbird/chat/poll';
import {SendbirdMessage} from '@sendbird/uikit-utils';
import {User} from '@sendbird/chat';
import { usePollVoters } from '../hooks/usePollVoters';

interface PollResultFragmentProps {
  pollMessage: SendbirdMessage;
  poll: Poll;
  channelUrl?: string;
}

export const PollResultFragment: React.FC<PollResultFragmentProps> = ({
  pollMessage,
  poll,
  channelUrl,
}) => {
  const { votersData, loading, error, getVotersForOption } = usePollVoters(poll, channelUrl);

  const isMultiSelect = poll.allowMultipleVotes;
  const totalVotes = poll.voterCount;

  const renderVoterAvatar = (voter: User) => (
    <View key={voter.userId} style={styles.voterItem}>
      <View style={styles.avatar}>
        {voter.profileUrl ? (
          <Image source={{ uri: voter.profileUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.defaultAvatar} />
        )}
      </View>
      <Text style={styles.voterNickname}>{voter.nickname}</Text>
    </View>
  );

  const renderPollOption = (option: PollOption, index: number) => {
    const voteCount = option.voteCount || 0;
    const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
    const voters = getVotersForOption(option.id);

    return (
      <View key={option.id} style={styles.optionContainer}>
        <View style={styles.optionHeader}>
          <Text style={styles.optionText}>{option.text}</Text>
          <Text style={styles.optionPercentage}>{percentage}% ({voteCount} votes)</Text>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${percentage}%` }]} />
        </View>

        {voters.length > 0 && (
          <View style={styles.votersContainer}>
            {voters.map(renderVoterAvatar)}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading poll results...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading poll results: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Poll Title */}
      <Text style={styles.pollTitle}>{poll.title || pollMessage.message}</Text>

      {/* Meta Info */}
      <Text style={styles.metaText}>
        {isMultiSelect ? 'Multi select' : 'Single select'} | {new Date(pollMessage.createdAt).toLocaleDateString('ko-KR')}
      </Text>

      {/* Total Votes */}
      <Text style={styles.totalVotesText}>
        {Math.round((totalVotes / (totalVotes || 1)) * 100)}% ({totalVotes} votes) in total
      </Text>

      {/* Poll Options */}
      <View style={styles.optionsContainer}>
        {poll.options.map((option, index) => renderPollOption(option, index))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  pollTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  totalVotesText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 24,
  },
  optionContainer: {
    marginBottom: 8,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  optionPercentage: {
    fontSize: 14,
    color: '#666',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6C5CE7',
    borderRadius: 3,
  },
  votersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  voterItem: {
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  defaultAvatar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ddd',
    borderRadius: 20,
  },
  voterNickname: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 50,
    marginHorizontal: 16,
  },
});
