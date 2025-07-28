import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Poll } from '@sendbird/chat/poll';
import { SendbirdMessage } from '@sendbird/uikit-utils';
import { PollResultFragment } from '../fragments/PollResultFragment';

interface PollResultScreenParams {
  pollMessage: SendbirdMessage;
  poll: Poll;
  channelUrl?: string;
}

const PollResultScreen = () => {
  const navigation = useNavigation();
  const { params } = useRoute<{ key: string; name: string; params: PollResultScreenParams }>();
  const { poll, pollMessage, channelUrl } = params;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Poll Detail</Text>
        <TouchableOpacity>
          <Text style={styles.menuButton}>⋮</Text>
        </TouchableOpacity>
      </View>

      <PollResultFragment
        pollMessage={pollMessage}
        poll={poll}
        channelUrl={channelUrl}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  menuButton: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
});

export default PollResultScreen;