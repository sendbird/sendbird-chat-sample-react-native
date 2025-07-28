import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SendbirdMessage } from '@sendbird/uikit-utils';
import {Poll, PollStatus} from '@sendbird/chat/poll';
import {useLocalization} from '@sendbird/uikit-react-native';
import { usePoll } from '../../hooks/usePoll';

interface PollMessageProps {
  message: SendbirdMessage;
  poll: Poll;
  channelUrl?: string;
  onVote: () => void;
  onViewResults: () => void;
  showCloseButton?: boolean;
}

export const PollMessage: React.FC<PollMessageProps> = ({
  message,
  poll,
  channelUrl,
  onVote,
  onViewResults,
  showCloseButton = false,
}) => {
  const { closePoll } = usePoll(channelUrl);

  const handleClosePress = async () => {
    try {
      await closePoll(poll.id);
    } catch (error) {
      console.error('Failed to close poll:', error);
    }
  };
  const isMultiSelect = poll.allowMultipleVotes;
  const isPollClosed = poll.status === PollStatus.CLOSED;
  const hasVoted = poll.votedPollOptionIds && poll.votedPollOptionIds.length > 0;
  const { STRINGS } = useLocalization();

  const totalVotes = poll.voterCount;

  const renderPollOptions = () => {
    if (isPollClosed || hasVoted) {
      // Show results with vote counts and percentages
      return poll?.options?.map((option: any, index: number) => {
        const voteCount = option.voteCount || 0;
        const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
        const isVotedOption = poll.votedPollOptionIds && poll.votedPollOptionIds.includes(option.id);

        return (
          <View key={option.id || index} style={[
            styles.resultOptionItem,
            isVotedOption && styles.votedOptionItem
          ]}>
            <View style={styles.optionHeader}>
              <Text style={[
                styles.optionText,
                isVotedOption && styles.votedOptionText
              ]}>
                {option.text}
                {isVotedOption && ' ✓'}
              </Text>
              <Text style={styles.percentageText}>{percentage}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[
                styles.progressBar,
                { width: `${percentage}%` },
                isVotedOption && styles.votedProgressBar
              ]} />
            </View>
            <Text style={styles.voteCountText}>{voteCount} votes</Text>
          </View>
        );
      });
    } else {
      // Show simple options for voting
      return poll?.options?.map((option: any, index: number) => (
        <View key={option.id || index} style={styles.optionItem}>
          <Text style={styles.optionText}>{option.text}</Text>
        </View>
      ));
    }
  };

  const renderActionButton = () => {
    if (isPollClosed) {
      return (
        <TouchableOpacity style={styles.viewMoreButton} onPress={onViewResults}>
          <Text style={styles.viewMoreButtonText}>View more</Text>
        </TouchableOpacity>
      );
    } else if (hasVoted) {
      // Show vote again button when user has voted
      return (
        <TouchableOpacity style={styles.voteAgainButton} onPress={onVote}>
          <Text style={styles.voteAgainButtonText}>Vote again</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity style={styles.voteButton} onPress={onVote}>
          <Text style={styles.voteButtonText}>Vote now</Text>
        </TouchableOpacity>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.pollContainer}>
        <Text style={styles.title}>{poll.title || message.message}</Text>

        {!isPollClosed && !hasVoted && (
          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>
              {isMultiSelect ? 'Multi select' : 'Single select'} | Created on{' '}
              {STRINGS.GROUP_CHANNEL.LIST_DATE_SEPARATOR(new Date(message.createdAt))}
            </Text>
          </View>
        )}

        <View style={styles.optionsContainer}>{renderPollOptions()}</View>

        {renderActionButton()}

        {!isPollClosed && (
          <View style={styles.actionButtons}>
            {showCloseButton && (
              <TouchableOpacity style={styles.actionButton} onPress={handleClosePress}>
                <Text style={styles.actionButtonText}>Close poll</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.actionButton} onPress={onViewResults}>
              <Text style={styles.actionButtonText}>View result</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 12,
  },
  pollContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  metaInfo: {
    marginBottom: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultOptionItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6C5CE7',
    borderRadius: 2,
  },
  voteCountText: {
    fontSize: 12,
    color: '#666',
  },
  voteButton: {
    backgroundColor: '#6C5CE7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  voteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  voteAgainButton: {
    backgroundColor: '#6C5CE7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  voteAgainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewMoreButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  viewMoreButtonText: {
    color: '#6C5CE7',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6C5CE7',
    backgroundColor: 'transparent',
  },
  actionButtonText: {
    color: '#6C5CE7',
    fontSize: 14,
    fontWeight: '500',
  },
  votedOptionItem: {
    borderColor: '#6C5CE7',
    borderWidth: 1,
  },
  votedOptionText: {
    fontWeight: '600',
    color: '#6C5CE7',
  },
  votedProgressBar: {
    backgroundColor: '#5B4FD1',
  },
});
