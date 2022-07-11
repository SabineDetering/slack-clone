import {
  ElementRef,
  Injectable,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { toArray } from 'rxjs';
import { Message } from 'src/models/message.class';

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  public messageToEdit!: Message;
  /* @ViewChildren */

  private editorSetup = (editor) => {
    editor.ui.registry.addButton('inline-code', {
      icon: 'sourcecode',
      onAction: (_) => {
        let selectionNode = editor.selection.getNode();
        let selection = editor.selection.getContent();
        console.log(selection);
        console.log(selection == '');
        console.log(selectionNode);
        console.log(selectionNode.innerText);
        console.log(editor.selection.getSel().anchorNode);
        console.log(editor.selection.getSel().anchorNode.textContent);
        console.log(
          selectionNode.innerText.trim() ==
            editor.selection.getSel().anchorNode.textContent.trim()
        );

        if (selection == '' && selectionNode.nodeName != 'CODE') {
          console.log('if')
          editor.execCommand('mceToggleFormat', false, 'code');
          console.log(editor.selection.getNode());
          let currentNode = editor.selection.getNode();
          editor.selection.select(currentNode, true);
          editor.selection.collapse(false);
          editor.insertContent('&nbsp;');
          /* editor.selection.select(currentSelection, true);
          editor.selection.collapse(true); */
          /*  let range = new Range()
          range.setStart(currentNode.firstChild, 0)
          range.setEnd(currentNode.firstChild, 0)
          editor.selection.setRng(range) */
          editor.selection.setCursorLocation(currentNode, 0);
          /* editor.execCommand('mceSelectNode', true, currentSelection); */
          /* editor.selection.collapse(false); */
          
        } else if(selection == '' && selectionNode.nodeName == 'CODE'){
          console.log('else if 1');
          console.log(selectionNode.innerText.trim() == '');
          editor.selection.select(selectionNode);
          editor.selection.setContent('');
        }
        else if (selection != '' && selectionNode.nodeName != 'CODE') {
          console.log('else if 2');
          editor.execCommand('mceToggleFormat', false, 'code');
          const currentSelection = editor.selection.getEnd();
          editor.selection.select(currentSelection, true);
          editor.selection.collapse(false);
          editor.insertContent('&nbsp;');
          editor.selection.select(currentSelection, true);
          editor.selection.collapse(false);
        } else if (selection != '' && selectionNode.nodeName == 'CODE') {
          console.log('else if 3');
          let tempDiv = document.createElement('div');
          tempDiv.innerHTML = selection;
          console.log(tempDiv);
          if (tempDiv.innerText.trim() == selectionNode.innerText.trim()) {
            editor.selection.setContent(`${selectionNode.innerText}`);
          }
          /* editor.setContent(`${selectionNode.innerText}`); */
          /* editor.selection.setContent(`${selectionNode.innerText}`); */
        } //  && selectionNode.innerText.trim() == editor.selection.getSel().anchorNode.textContent.trim()
      },
    });
    editor.ui.registry.addButton('code-block', {
      text: '[...]',
      onAction: (_) => {
        let selectionNode = editor.selection.getNode();
        let selection = editor.selection.getNode().innerHTML;
        if (selectionNode.nodeName == 'PRE') {
          editor.setContent(`<p>${selection}</p>`);
        } else editor.execCommand('mceToggleFormat', false, 'pre');
      },
    });
  };

  public editorConfig = {
    height: '20vh',
    plugins: 'lists link image table code help wordcount emoticons',
    base_url: '/tinymce',
    suffix: '.min',
    menubar: false,
    statusbar: false,
    setup: this.editorSetup,
    toolbar:
      'undo redo | emoticons | bold italic underline | inline-code code-block blockquote select-node| link | lists',
    toolbar_groups: {
      aligning: {
        icon: 'align-left',
        tooltip: 'Aligning',
        items: 'alignleft aligncenter alignright alignjustify',
      },
      lists: {
        icon: 'unordered-list',
        tooltip: 'Lists',
        items: 'bullist numlist',
      },
    },
    formats: {
      code: {
        inline: 'code',
        styles: {
          color: '#e01e5a',
          backgroundColor: '#eee',
          border: '1px solid #ddd',
        },
      },
      pre: {
        block: 'pre',
        styles: {
          backgroundColor: '#eee',
          borderRadius: '5px',
          border: '1px solid #ddd',
          padding: '5px',
        },
      },
    },
    /*     style_formats: [
      { title: 'Code', format: 'code' },
      { title: 'Pre', format: 'pre' },
    ], */
  };

  constructor() {}
}
