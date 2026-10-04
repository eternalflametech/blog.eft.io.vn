---
trigger: model_decision
description: enforce markdown editor features, live preview, toolbar actions, frontmatter parsing, autosave, and publication workflows
---

# Blog Editor Directives

## 1. Editor Interface & Real-Time Preview
- **Split-Pane Layout:** Provide a dual-pane editor interface with raw Markdown on the left and synchronized live preview on the right on desktop, with toggleable single-pane modes for mobile.
- **Synchronized Scroll:** Implement proportional scroll synchronization between the Markdown textarea/editor and the rendered HTML preview container.
- **Dark Theme Integration:** Style all editor controls using EFT Dark Theme tokens (`bg-zinc-950`, `bg-zinc-925`, `border-white/10`, `text-zinc-100`, `focus:ring-violet-500`).

## 2. Formatting Toolbar & Keyboard Shortcuts
- **Formatting Actions:** Provide quick toolbar controls for:
  - Text styles: Bold (`**`), Italic (`*`), Strikethrough (`~~`), Inline Code (`` ` ``).
  - Structure: Headings (H1 through H4), Blockquote (`>`), Horizontal Rule (`---`).
  - Lists: Unordered bullet lists, ordered number lists, interactive task check-lists (`- [ ]`).
  - Elements: Links (`[text](url)`), Tables with column alignments, and Footnotes (`[^1]`).
- **Standard Keyboard Shortcuts:** Support intuitive hotkeys:
  - `Ctrl/Cmd + B`: Bold text.
  - `Ctrl/Cmd + I`: Italic text.
  - `Ctrl/Cmd + K`: Insert link dialog.
  - `Ctrl/Cmd + S`: Trigger draft save.
  - `Tab` / `Shift + Tab`: Indent / Outdent list items and code lines.

## 3. Media Ingestion, Syntax Highlighting & LaTeX Formulas
- **Drag-and-Drop & Clipboard Uploads:** Allow users to drag image files directly onto the editor canvas or paste image data from the clipboard. Automatically trigger upload to the asset endpoint (`/api/v2/assets`) and inject Markdown image markup `![alt]({url})` at current cursor position.
- **Syntax Highlighting:** Render fenced code blocks with language detection, syntax coloring using EFT theme tokens, and a one-click copy button.
- **LaTeX Math Typesetting (KaTeX):** Render inline math expressions (`$formula$`) and display block math formulas (`$$formula$$`) seamlessly in both real-time preview and public article reader views using KaTeX with dark theme typography.

## 4. Frontmatter Management & Metadata
- **Structured Fields:** Provide intuitive UI fields or YAML frontmatter parsing for article metadata:
  - `title`: Post title in Vietnamese.
  - `slug`: Auto-generated normalized slug with manual edit capability.
  - `tags`: Tag array with auto-completion.
  - `cover_image`: Cover banner URL from asset library.
  - `excerpt`: Brief summary for cards and search snippets.
  - `published_at`: Scheduled or instant publish timestamp.
- **Validation:** Validate frontmatter fields before allowing transition to publish state.

## 5. Draft Autosave & Explicit Publication Flow
- **Debounced Autosave:** Automatically persist draft changes to browser local storage and debounced backend draft endpoint every 30 seconds of inactivity.
- **Dirty State Indicator:** Display clear visual indicators for unsaved changes, saving status, and saved confirmation.
- **Explicit Publishing:** Drafts must remain private and unlisted until the administrator explicitly clicks the "Publish" button and confirms the action.
