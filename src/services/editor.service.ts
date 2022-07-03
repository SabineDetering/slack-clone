import { Injectable } from '@angular/core';
import { Message } from 'src/models/message.class';

@Injectable({
  providedIn: 'root'
})
export class EditorService {

  public messageToEdit!: Message;

  private editorSetup = (editor) => {
    editor.ui.registry.addButton('inline-code', {
      icon: 'sourcecode',
      onAction: (_) => {
        let selectionNode = editor.selection.getNode();
        let selection = editor.selection.getContent() || ' ';
        console.log(selection)
        if (selectionNode.nodeName != 'CODE') {
          editor.insertContent(
            `<code style="color: #e01e5a; background-color: #eee; border: 1px solid #ddd">${selection}</code>`
          );
        } else {
          editor.setContent(`${selection}`);
        }
      },
    });
    editor.ui.registry.addButton('code-block', {
      text: '[...]',
      onAction: (_) => {
        let selectionNode = editor.selection.getNode();
        let selection = editor.selection.getNode().innerHTML || ' ';
        if (selectionNode.nodeName != 'PRE') {
          editor.setContent(
            `<pre style="background-color: #eee; border: 1px solid #ddd; padding: 5px">${selection}</pre>`
          );
        } else {
          editor.setContent(`<p>${selection}</p>`);
        }
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
      'undo redo | emoticons | bold italic underline | inline-code code-block blockquote | link | aligning lists',
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
    style_formats_merge: true,
  };
  
  constructor() { }
}
