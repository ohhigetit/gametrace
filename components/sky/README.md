# Sky Conversation Components V1 — Local Review Package

Design reference: approved `GameTrace_SkyConversationViewV1_Interactive_Preview.html`.

This package is a **modular prototype**, not a production AI integration. Uses DOM-based reusable components under `window.GameTraceSkyV1` and is styled by `sky-conversation-v1.css`.

Components:
- `ConversationHeaderV1` — navigation, title and conversation menu.
- `ConversationContextV1` — collapsible selected-notes reference.
- `ConversationMessagesV1` — rendered chronological player/Sky messages.
- `ConversationComposerV1` — input, attach, recap, discovery actions.
- `DiscoveryCardV1` — refine, discuss, approve or dismiss suggestions.
- `SkyConversationViewV1` — composition, thread switching and simulated conversation adapter.

`SkyConversationViewV1({avatarSrc,threads,notes,onBack,onApproveDiscovery,onSendMessage})` returns `{element,overlay,loadThread,getSelectedNotes,getThread,destroy}`. Append both `element` and `overlay` to the document. Data changes, persistence, retrieval and AI calls must be supplied by the host app; none are implemented here. Sample prompt/confirm interactions are for local prototype review only, not final UX. No Netlify deployment or production GitHub changes.
