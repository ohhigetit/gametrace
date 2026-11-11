# Sky Conversation Components V1.1 — Integration Contract

**Status:** Reusable component implementation on `feature/component-library`. **Not deployed and not yet installed in the standalone Sky Live AI server or the live GameTrace host.** No database changes or production writes.

## Implemented V1.1 UI

- Fixed-height chat shell (up to 680px on desktop; viewport height on mobile).
- Independently scrollable conversation messages. Header, selected-notes reference, and composer stay outside the scrolling pane.
- Quick-reply options below Sky's messages; choices disable after selection.
- Notes-first opening: “Hey G! Are we refining your notes today?”
- Destination/category selection and contextual recent-note choices.
- Reusable discovery card with **Approve & Save to My DNA** or **Approve & Save to Playbook**, refine/discuss/dismiss.
- Explicit save confirmation and no false “Saved” result without an actual host acknowledgment.
- Related note and latest-note retrieval through an **injected Sky Data Service** if supplied.
- Response adapter supports text or structured `{text,options,discovery}` results.

## Component usage

Load the following scripts in order:

1. `sky-core-v1.js`
2. `sky-conversation-header-v1.js`
3. `sky-conversation-context-v1.js`
4. `sky-conversation-messages-v1.js`
5. `sky-conversation-composer-v1.js`
6. `sky-discovery-card-v1.js`
7. `sky-conversation-view-v1.js`

Also load `sky-conversation-v1.css` and (if using the adapter) `data/sky-data-service-v1.js`.

```js
// Example contract; the host application must provide the real authenticated
// snapshot and permission check. Never assume arbitrary client-side player IDs
// are authorization.
const dataService = GameTraceSkyDataV1.createSkyDataService({
  getSnapshot: () => authorizedSnapshot,
  authorizePlayer: player => appHasAuthorizedAccess(player)
});

const sky = GameTraceSkyV1.SkyConversationViewV1({
  avatarSrc: approvedSkyAvatar,
  player: 'Georgina',
  dataService, // automatic read/search, no manual note entry
  onSendMessage: async (message, context) => {
    // Call the host's authorized AI endpoint and return
    // {text: string, options?: Array<string | {label,value}>,
    //  discovery?: {category,statement,sourceKeys?: string[]}}
    return await secureSkyAIRequest(message, context);
  },
  onSaveDiscovery: async ({player, threadId, proposal}) => {
    // MUST require authenticated authorization, exact-statement approval,
    // valid category, RLS, duplicate checks and idempotent persistence.
    // Return {saved:true,id} only after actual committed persistence.
    return await authorizedGameTraceSave({player, threadId, proposal});
  }
});
document.body.append(sky.element, sky.overlay);
```

## Read and write boundaries

- The data service is **read-only** and needs the host's data snapshot and authorization. It does **not** automatically connect itself to Supabase or a live GameTrace page.
- Existing GameTrace/Sky host integration is still required to supply `dataService` and `onSendMessage`.
- `onSaveDiscovery` is a **host callback contract**, not a write endpoint. A My DNA persistence model and authorized write adapter must be implemented and verified before live saving works.
- An older `onApproveDiscovery` parameter was used for prototype previews. It must **not** be used to signal persistence. The V1.1 component only regards `onSaveDiscovery` returning `{saved:true}` as a confirmed save.
- `dataService.prepareProposal` returns `PROPOSED_NOT_SAVED`; this is never counted as saved.
- The app's security layer must revalidate authenticated family/player permissions and source ownership, enforce original notes' immutability, and return a committed result.
- If save is not connected or fails, the discovery card remains a draft and displays **NOT SAVED**.
- Private Prayer/Commitment records and deleted/revoked records remain excluded by the data service.

## Remaining end-to-end work

1. Mount V1.1 in the actual Sky standalone page with the existing V3.1 instructions.
2. Supply real authorized GameTrace data access; use the read service with server-side authentication for AI retrieval.
3. Implement/version the My DNA and Playbook persistence contracts, security rules, duplicate handling and auditability.
4. Wire `onSaveDiscovery` to those authenticated endpoints.
5. Run real-browser and save/reload verification across desktop, iPhone portrait/landscape and all three reflection categories.

**No Netlify deployment and no writes to dev/prod were performed.**
