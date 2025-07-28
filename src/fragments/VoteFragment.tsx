import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Poll, PollOption } from '@sendbird/chat/poll';
import { SendbirdMessage } from '@sendbird/uikit-utils';
import { useSendbirdChat } from '@sendbird/uikit-react-native';
import { useGroupChannel } from '@sendbird/uikit-chat-hooks';

interface VoteFragmentProps {
  pollMessage: SendbirdMessage;
  poll: Poll;
  channelUrl?: string;
  onVoteSubmitted?: () => void;
}

export const VoteFragment: React.FC<VoteFragmentProps> = ({
  pollMessage,
  poll,
  channelUrl,
  onVoteSubmitted,
}) => {
  const { sdk } = useSendbirdChat();
  const { channel } = useGroupChannel(sdk, channelUrl || '');

  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [newOptionText, setNewOptionText] = useState('');
  const [showAddOption, setShowAddOption] = useState(false);

  const isMultiSelect = poll.allowMultipleVotes;
  const allowUserSuggestion = poll.allowUserSuggestion;

  const handleOptionSelect = useCallback((optionId: number) => {
    if (isMultiSelect) {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  }, [isMultiSelect]);

  const handleSubmitVote = useCallback(async () => {
    if (selectedOptions.length === 0) return;
    
    try {
      if (channel) {
        await channel.votePoll(poll.id, selectedOptions);
      }
      onVoteSubmitted?.();
    } catch (error) {
      console.error('Error voting on poll:', error);
    }
  }, [selectedOptions, poll.id, channel, onVoteSubmitted]);

  const handleAddOption = useCallback(() => {
    if (newOptionText.trim()) {
      // TODO: Implement add option functionality
      setNewOptionText('');
      setShowAddOption(false);
    }
  }, [newOptionText]);

  const renderCheckbox = (isSelected: boolean) => (
    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
      {isSelected && <Text style={styles.checkmark}>✓</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Poll Title */}
        <Text style={styles.pollTitle}>{poll.title || pollMessage.message}</Text>
        
        {/* Meta Info */}
        <Text style={styles.metaText}>
          {isMultiSelect ? 'Multi select' : 'Single select'} | {new Date(pollMessage.createdAt).toLocaleDateString('ko-KR')}
        </Text>

        {/* Poll Options */}
        <View style={styles.optionsContainer}>
          {poll.options.map((option: PollOption) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionItem}
              onPress={() => handleOptionSelect(option.id)}
            >
              {renderCheckbox(selectedOptions.includes(option.id))}
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))}

          {/* Add Option */}
          {allowUserSuggestion && (
            <>
              {showAddOption ? (
                <View style={styles.addOptionContainer}>
                  <View style={styles.addOptionInputContainer}>
                    <View style={styles.checkbox} />
                    <TextInput
                      style={styles.addOptionInput}
                      value={newOptionText}
                      onChangeText={setNewOptionText}
                      placeholder="단답 제안"
                      autoFocus
                    />
                    <TouchableOpacity onPress={handleAddOption} style={styles.addOptionButton}>
                      <Text style={styles.addOptionButtonText}>✓</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowAddOption(false)} style={styles.cancelButton}>
                      <Text style={styles.cancelButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addOptionTrigger}
                  onPress={() => setShowAddOption(true)}
                >
                  <View style={styles.checkbox} />
                  <Text style={styles.addOptionText}>Add option +</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>

      {/* Submit Button */}
      {selectedOptions.length > 0 && (
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitVote}>
          <Text style={styles.submitButtonText}>Submit Vote</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
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
    marginBottom: 24,
  },
  optionsContainer: {
    flex: 1,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#6C5CE7',
    borderColor: '#6C5CE7',
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  addOptionContainer: {
    paddingVertical: 16,
  },
  addOptionInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addOptionInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#6C5CE7',
    paddingVertical: 4,
    marginRight: 8,
  },
  addOptionButton: {
    padding: 8,
  },
  addOptionButtonText: {
    color: '#6C5CE7',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addOptionTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  addOptionText: {
    fontSize: 16,
    color: '#6C5CE7',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#6C5CE7',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});