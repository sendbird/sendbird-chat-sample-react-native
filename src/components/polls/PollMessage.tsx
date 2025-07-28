import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SendbirdMessage } from '@sendbird/uikit-utils';
import {Poll, PollStatus} from '@sendbird/chat/poll';
import {useLocalization} from '@sendbird/uikit-react-native';

interface PollMessageProps {
  message: SendbirdMessage;
  poll: Poll;
  onVote: () => void;
  onViewResults: () => void;
  onClosePress?: () => void;
}

export const PollMessage: React.FC<PollMessageProps> = ({
  message,
  poll,
  onVote,
  onViewResults,
  onClosePress,
}) => {
  const totalVotes = poll.voterCount;
  const isMultiSelect = poll.allowMultipleVotes;
  const isPollClosed = poll.status === PollStatus.CLOSED;
  const { STRINGS } = useLocalization();

  return (
    <View style={styles.container}>
      <View style={styles.pollContainer}>
        <Text style={styles.title}>{poll.title || message.message}</Text>

        <View style={styles.metaInfo}>
          <Text style={styles.metaText}>
            {isMultiSelect ? 'Multi select' : 'Single select'} | Created on {STRINGS.GROUP_CHANNEL.LIST_DATE_SEPARATOR(new Date(message.createdAt))}
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {poll?.options?.map((option: any, index: number) => (
            <View key={option.id || index} style={styles.optionItem}>
              <Text style={styles.optionText}>{option.text}</Text>
            </View>
          ))}
        </View>

        {!isPollClosed && (
          <TouchableOpacity style={styles.voteButton} onPress={onVote}>
            <Text style={styles.voteButtonText}>Vote now</Text>
          </TouchableOpacity>
        )}

        <View style={styles.actionButtons}>
          {onClosePress && (
            <TouchableOpacity style={styles.actionButton} onPress={onClosePress}>
              <Text style={styles.actionButtonText}>Close poll</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButton} onPress={onViewResults}>
            <Text style={styles.actionButtonText}>View result</Text>
          </TouchableOpacity>
        </View>
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
  optionText: {
    fontSize: 14,
    color: '#333',
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
});
