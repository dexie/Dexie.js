import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

import { useEditor, EditorContent } from '@tiptap/react';
import { useDocument, useObservable } from 'dexie-react-hooks';
import * as Y from 'yjs';
import { db } from '../../db';
import { Suspense, useMemo } from 'react';
import { DexieYProvider } from 'dexie';

function randomCollaborationColor(userId: string | undefined) {
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF'];
  if (userId) {
    return colors[
      (userId.charCodeAt(0) +
        (userId.charCodeAt(3) || 0) +
        (userId.charCodeAt(5) || 0)) %
        colors.length
    ];
  }
  return colors[0];
}

export function TiptapEditor({ doc }: { doc: Y.Doc }) {
  console.log('TiptapEditor');
  const provider = useDocument(doc);
  if (!provider || !provider.awareness) return null;
  return <Suspense fallback={null}><TiptapEditorInner doc={doc} provider={provider}/></Suspense>;
}

export function TiptapEditorInner({ doc, provider }: { doc: Y.Doc, provider: DexieYProvider<Y.Doc> }) {
  if (!doc.isLoaded) throw doc.whenLoaded;
  console.log('TiptapEditorInner');
  const currentUser = useObservable(db.cloud.currentUser);
  // Collaboration color:
  const collaborationColor = useMemo(
    () => randomCollaborationColor(currentUser?.userId),
    [currentUser?.userId]
  );
  // Open Tiptap rich-text editor:
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Collaboration.configure({
        document: doc,
      }),
      CollaborationCursor.configure({
        provider,
        user: {
          name: currentUser?.name || 'Anonymous',
          color: collaborationColor,
        },
      })
    ],
  });
  return <>
    <input type="text" defaultValue={''+doc.getMap("title").get("hej")} onChange={ev => doc.getMap("title").set("hej", ev.target.value)} />
    <EditorContent editor={editor} />
  </>
}