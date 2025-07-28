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
import { VoteFragment } from '../fragments/VoteFragment';

interface VoteScreenParams {
  pollMessage: SendbirdMessage;
  poll: Poll;
  channelUrl?: string;
}

const VoteScreen = () => {
  const navigation = useNavigation();
  const { params } = useRoute<{ key: string; name: string; params: VoteScreenParams }>();
  const { poll, pollMessage, channelUrl } = params;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vote</Text>
        <View style={styles.placeholder} />
      </View>

      <VoteFragment
        pollMessage={pollMessage}
        poll={poll}
        channelUrl={channelUrl}
        onVoteSubmitted={() => navigation.goBack()}
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
    justifyContent: 'flex-start',
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
    marginLeft: 20,
  },
  placeholder: {
    width: 24,
  },
});

export default VoteScreen;
