import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import {
  Header,
  Icon,
  useUIKitTheme,
  createStyleSheet,
} from '@sendbird/uikit-react-native-foundation';
import { useSendbirdChat } from '@sendbird/uikit-react-native';
import { useGroupChannel } from '@sendbird/uikit-chat-hooks';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {PollCreateParams} from '@sendbird/chat/poll';

export interface PollChoice {
  id: string;
  text: string;
}

export interface PollCreateFragmentProps {
  channelUrl: string;
  onCancel: () => void;
  onPollCreated: () => void;
}

const PollCreateFragment: React.FC<PollCreateFragmentProps> = ({
  channelUrl,
  onCancel,
  onPollCreated,
}) => {
  const { colors } = useUIKitTheme();
  const { sdk } = useSendbirdChat();
  const { channel } = useGroupChannel(sdk, channelUrl);

  // Form state
  const [title, setTitle] = useState('');
  const [choices, setChoices] = useState<PollChoice[]>([
    { id: '1', text: '' },
    { id: '2', text: '' }
  ]);
  const [closingTime, setClosingTime] = useState<Date | null>(null);
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
  const [allowUserSuggestion, setAllowUserSuggestion] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');
  const [isLoading, setIsLoading] = useState(false);

  const styles = createStyleSheet({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.onBackground01,
      marginBottom: 8,
    },
    titleInput: {
      borderWidth: 1,
      borderColor: colors.onBackground04,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.onBackground01,
      backgroundColor: colors.background,
    },
    choiceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    choiceInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.onBackground04,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.onBackground01,
      backgroundColor: colors.background,
      marginRight: 8,
    },
    removeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.error,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addOptionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 8,
      backgroundColor: 'transparent',
    },
    addOptionText: {
      color: colors.primary,
      fontSize: 16,
      marginLeft: 8,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    optionText: {
      fontSize: 16,
      color: colors.onBackground01,
    },
    dropdownButton: {
      borderWidth: 1,
      borderColor: colors.onBackground04,
      borderRadius: 8,
      padding: 12,
      backgroundColor: colors.background,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dropdownText: {
      fontSize: 16,
      color: colors.onBackground01,
    },
    dateTimeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dateTimeButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.onBackground04,
      borderRadius: 8,
      padding: 12,
      backgroundColor: colors.background,
      marginRight: 8,
    },
    dateTimeText: {
      fontSize: 16,
      color: colors.onBackground01,
    },
    switchContainer: {
      marginLeft: 8,
    },
    headerButton: {
      color: colors.primary,
      fontSize: 16,
    },
    headerButtonDisabled: {
      color: colors.onBackground04,
      fontSize: 16,
    },
    sendButton: {
      fontWeight: '600',
    },
  });

  const addChoice = useCallback(() => {
    if (choices.length < 10) {
      const newChoice: PollChoice = {
        id: Date.now().toString(),
        text: ''
      };
      setChoices([...choices, newChoice]);
    }
  }, [choices]);

  const removeChoice = useCallback((id: string) => {
    if (choices.length > 2) {
      setChoices(choices.filter(choice => choice.id !== id));
    }
  }, [choices]);

  const updateChoice = useCallback((id: string, text: string) => {
    setChoices(choices.map(choice =>
      choice.id === id ? { ...choice, text } : choice
    ));
  }, [choices]);

  const showDatePicker = (mode: 'date' | 'time' = 'date') => {
    setDatePickerMode(mode);
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDateTime = (date: Date) => {
    setClosingTime(date);
    hideDatePicker();
  };

  const handleSend = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a poll title');
      return;
    }

    const validChoices = choices.filter(choice => choice.text.trim());
    if (validChoices.length < 2) {
      Alert.alert('Error', 'Please provide at least 2 choices');
      return;
    }

    if (!channel) {
      Alert.alert('Error', 'Channel not found');
      return;
    }

    setIsLoading(true);

    try {
      // Create poll using Sendbird Poll API
      const pollCreateParam: PollCreateParams = {
        title: title.trim(),
        optionTexts: validChoices.map(choice => choice.text.trim()),
        allowMultipleVotes,
        allowUserSuggestion,
        closeAt: closingTime ? Math.floor(closingTime.getTime() / 1000) : undefined,
      };
      const poll = await sdk.poll.create(pollCreateParam);

      // Send poll message
      const messageHandler = channel.sendUserMessage({
        message: title.trim(),
        pollId: poll.id,
        customType: 'poll',
      });

      messageHandler.onSucceeded(() => {
        setIsLoading(false);
        onPollCreated();
      });

      messageHandler.onFailed((error) => {
        setIsLoading(false);
        Alert.alert('Error', 'Failed to send poll: ' + error.message);
      });

    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to create poll: ' + error.message);
    }
  };

  const canSend = title.trim() && choices.filter(c => c.text.trim()).length >= 2 && !isLoading;

  return (
    <View style={styles.container}>
      <Header
        title="Create a poll"
        left={
          <TouchableOpacity onPress={onCancel} disabled={isLoading}>
            <Text style={styles.headerButton}>Cancel</Text>
          </TouchableOpacity>
        }
        right={
          <TouchableOpacity onPress={handleSend} disabled={!canSend}>
            <Text style={[
              canSend ? styles.headerButton : styles.headerButtonDisabled,
              styles.sendButton
            ]}>
              {isLoading ? 'Sending...' : 'Send'}
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content}>
        {/* Title Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Title</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Enter question"
            value={title}
            onChangeText={setTitle}
            maxLength={500}
            editable={!isLoading}
          />
        </View>

        {/* Choices Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choices</Text>
          {choices.map((choice) => (
            <View key={choice.id} style={styles.choiceContainer}>
              <TextInput
                style={styles.choiceInput}
                placeholder="Enter choice"
                value={choice.text}
                onChangeText={(text) => updateChoice(choice.id, text)}
                maxLength={100}
                editable={!isLoading}
              />
              {choices.length > 2 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeChoice(choice.id)}
                  disabled={isLoading}
                >
                  <Icon icon="close" size={16} color={colors.onBackgroundReverse01} />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {choices.length < 10 && (
            <TouchableOpacity
              style={styles.addOptionButton}
              onPress={addChoice}
              disabled={isLoading}
            >
              <Icon icon="add" size={20} color={colors.primary} />
              <Text style={styles.addOptionText}>Add option</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Closing Time Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Closing time</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={[styles.dateTimeButton, { marginRight: 4 }]}
              onPress={() => showDatePicker('date')}
              disabled={isLoading || !closingTime}
            >
              <Text style={styles.dateTimeText}>
                {closingTime
                  ? closingTime.toLocaleDateString()
                  : 'Select date'
                }
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateTimeButton, { marginLeft: 4, marginRight: 8 }]}
              onPress={() => showDatePicker('time')}
              disabled={isLoading || !closingTime}
            >
              <Text style={styles.dateTimeText}>
                {closingTime
                  ? closingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Select time'
                }
              </Text>
            </TouchableOpacity>
            <View style={styles.switchContainer}>
              <Switch
                value={!!closingTime}
                onValueChange={(enabled) => {
                  if (!enabled) {
                    setClosingTime(null);
                  } else {
                    const now = new Date();
                    now.setHours(now.getHours() + 1); // Default to 1 hour from now
                    setClosingTime(now);
                  }
                }}
                trackColor={{ false: colors.onBackground04, true: colors.primary }}
                thumbColor={colors.onBackgroundReverse01}
                disabled={isLoading}
              />
            </View>
          </View>
        </View>

        {/* Additional Options */}
        <View style={styles.section}>
          <View style={styles.optionRow}>
            <Text style={styles.optionText}>Allow multiple votes</Text>
            <Switch
              value={allowMultipleVotes}
              onValueChange={setAllowMultipleVotes}
              trackColor={{ false: colors.onBackground04, true: colors.primary }}
              thumbColor={colors.onBackgroundReverse01}
              disabled={isLoading}
            />
          </View>

          <View style={styles.optionRow}>
            <Text style={styles.optionText}>Allow others to add choices</Text>
            <Switch
              value={allowUserSuggestion}
              onValueChange={setAllowUserSuggestion}
              trackColor={{ false: colors.onBackground04, true: colors.primary }}
              thumbColor={colors.onBackgroundReverse01}
              disabled={isLoading}
            />
          </View>
        </View>
      </ScrollView>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode={datePickerMode}
        onConfirm={handleConfirmDateTime}
        onCancel={hideDatePicker}
        date={closingTime || new Date()}
        minimumDate={new Date()}
      />
    </View>
  );
};

export default PollCreateFragment;
