import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import PollCreateFragment from '../fragments/PollCreateFragment';

const PollCreateScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { channelUrl } = route.params;

  const handleCancel = () => {
    navigation.goBack();
  };

  const handlePollCreated = () => {
    navigation.goBack();
  };

  return (
    <PollCreateFragment
      channelUrl={channelUrl}
      onCancel={handleCancel}
      onPollCreated={handlePollCreated}
    />
  );
};

export default PollCreateScreen;

