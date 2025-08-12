# Poll Sample Customization Guide

This project is a sample implementation that adds Poll (voting) functionality to Sendbird UIKit for React Native (@sendbird/uikit-react-native) and @sendbird/chat. Below is an explanation of the main customization code and its roles.

## src/components
- **CustomAttachmentsButton.tsx**: Customizes the attachment button in the group channel screen to provide a Poll creation menu via BottomSheet.
- **CustomChannelInput.tsx**: Customizes the channel input to add Poll-related UI and actions.
- **polls/PollMessage.tsx**: Detects Poll message types and renders voting messages.

## src/fragments
- **PollCreateFragment.tsx**: Handles the logic and UI for the Poll creation screen.
- **VoteFragment.tsx**: Handles the logic and UI for voting in a Poll.
- **PollResultFragment.tsx**: Handles the logic and UI for displaying Poll results.

## src/hooks
- **usePoll.ts**: Custom hook for managing Poll-related data and state.
- **usePollVoters.ts**: Custom hook for managing Poll voter lists.

## src/screens
- **GroupChannelScreen.tsx**: Main group channel screen, includes Poll message rendering and navigation to Poll create/vote/result screens.
- **PollCreateScreen.tsx**: Poll creation screen.
- **VoteScreen.tsx**: Poll voting screen.
- **PollResultScreen.tsx**: Poll result screen.

## Key Customization Points
- **Poll Message Rendering**: In GroupChannelScreen, renderMessage is customized to detect Poll message types and render them using the PollMessage component.
- **Poll Creation Flow**: When the AttachmentsButton is clicked, a BottomSheet appears with a Poll menu. Selecting Poll navigates to the PollCreateScreen.
