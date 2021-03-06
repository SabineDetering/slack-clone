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
        let tempDiv = document.createElement('div');
        tempDiv.innerHTML = selection;

        //insert empty inline-code
        if (selection == '' && selectionNode.nodeName != 'CODE') {
          editor.execCommand('mceToggleFormat', false, 'code');
          let currentNode = editor.selection.getNode();
          editor.selection.select(currentNode, true);
          editor.selection.collapse(false);
          editor.insertContent('&nbsp;');
          editor.selection.setCursorLocation(currentNode, 0);
          
          // remove empty inline-code
        } else if(selection == '' && selectionNode.nodeName == 'CODE' && selectionNode.innerText == ''){
          editor.selection.select(selectionNode);
          editor.selection.setContent('');
        }

        // format unformatted text
        else if (selection != '' && selectionNode.nodeName != 'CODE' && tempDiv.firstChild.nodeName != 'CODE') {
          editor.execCommand('mceToggleFormat', false, 'code');
          const currentSelection = editor.selection.getEnd();
          editor.selection.select(currentSelection, true);
          editor.selection.collapse(false);
          editor.insertContent('&nbsp;');
          editor.selection.select(currentSelection, true);
          editor.selection.collapse(false);

          // unformat formatted text
        } else if (selection != ''&& tempDiv.firstChild.nodeName == 'CODE' && tempDiv.innerText.trim() == selectionNode.innerText.trim()) {
            editor.selection.setContent(`${selectionNode.innerText}`);
          }
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
