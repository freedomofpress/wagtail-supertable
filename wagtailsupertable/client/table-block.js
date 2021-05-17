/* eslint-env jquery */
import { stateToHTML } from 'draft-js-export-html';

( function( window ) {
  function createTableRichTextEditor() {
    const RichTextEditor = window.Handsontable.editors.BaseEditor.prototype.extend();

    RichTextEditor.prototype.beginEditing = function() {
      const initialCellValue = this.instance.getValue();
      let contentState;
      const blocksFromHTML = initialCellValue ? window.DraftJS.convertFromHTML( initialCellValue ) : null;
      if ( blocksFromHTML && blocksFromHTML.contentBlocks ) {
        contentState = window.DraftJS.ContentState.createFromBlockArray( blocksFromHTML.contentBlocks, blocksFromHTML.entityMap );
      } else {
        contentState = window.DraftJS.ContentState.createFromText( '' );
      }

      const cellValue = window.DraftJS.convertToRaw( contentState );
      if ( cellValue.entityMap ) {
        for ( const entity in cellValue.entityMap ) {
          if ( cellValue.entityMap[entity] && cellValue.entityMap[entity].data ) {
            cellValue.entityMap[entity].data.url = cellValue.entityMap[entity].data.href;
            if ( cellValue.entityMap[entity].data.url.startsWith( '/documents/' ) ) {
              cellValue.entityMap[entity].type = 'DOCUMENT';
            }
          }
        }
      }
      const cellProperties = this.cellProperties;
      const instance = this.instance;

      instance.deselectCell();
      const modalDom = showModal();
      const editorHtml = _createRichTextEditor( cellValue );

      modalDom.on( 'save-btn:clicked', function() {
        const editorValue = editorHtml.value;
        let html;

        /* If editor is empty then set html to null becasue some 3rd parrty helper
            functions don't play nicely with empty valu cells */
        if ( !editorValue || editorValue === 'null' ) {
          html = null;
        } else {
          const raw = JSON.parse( editorValue );
          const state = window.DraftJS.convertFromRaw( raw );
          const options = {
            entityStyleFn: entity => {
              const entityType = entity.get( 'type' ).toLowerCase();
              if ( entityType === 'document' ) {
                const data = entity.getData();
                return {
                  element: 'a',
                  attributes: {
                    'href': data.url,
                    'data-linktype': 'DOCUMENT',
                    'data-id': data.id,
                    'type': 'DOCUMENT'
                  },
                  style: {
                  }
                };
              }
              return null;
            }
          };
          html = stateToHTML( state, options );
        }

        instance.setDataAtCell( cellProperties.row, cellProperties.col, html );
        instance.render();
      } );

    };

    // Put editor in dedicated namespace
    window.Handsontable.editors.RichTextEditor = RichTextEditor;

    // Register alias
    window.Handsontable.editors.registerEditor('richtext', RichTextEditor);

    
  }

  function setCustomContextMenus(){
    window.Handsontable.hooks.add('beforeContextMenuSetItems', function(items) {

      // Add richtext edit option in right click menu
      var richtextMenu = items.find((item) => item.name == "richtext");
      if (richtextMenu) {
        richtextMenu.name = "Open richtext editor";
        richtextMenu.key = "richtext";
        richtextMenu.callback = makeEditorRichText;
      }

      // Add background color to cells
      var colorMenu = items.find((item) => item.name == "color");
      if (colorMenu) {
        colorMenu.name = "Add background color";
        colorMenu.key = "color";
        colorMenu.submenu = {
          items: [{
            key: 'color:red',
            name: 'Red',
            callback: setCellColor
          }, {
            key: 'color:green',
            name: 'Green',
            callback: setCellColor
          }, {
            key: 'color:yellow',
            name: 'Yellow',
            callback: setCellColor
          }]
        }
      }
    });
  }

  function makeEditorRichText(key, selection, clickEvent) {
    this.setCellMeta(selection[0].start.row, selection[0].start.col, 'editor', 'richtext');
    this.selectCell(selection[0].start.row, selection[0].start.col);
    this.getActiveEditor().beginEditing();
  }

  function setCellColor(key, opt) {
  	let color = key.substring(6);
  	for (let i = opt[0].start.row; i <= opt[0].end.row; i++) {
      for (let j = opt[0].start.col; j <= opt[0].end.col; j++) {
        this.setCellMeta(i, j, 'className', color);
        this.render();
      }
    }
  }



  function showModal( ) {
    let modalDom;
    let modalBodyDom;
    let bodyDom = null;
    let saveBtnDom;

    // Set header template.
    const MODAL_BODY_TEMPLATE = [
      '<header class="nice-padding hasform">',
      '<div class="row">',
      '<div class="left">',
      '<div class="col">',
      '<h1 class="icon icon-table">Edit Table Cell</h1>',
      '</div>',
      '</div>',
      '</div>',
      '</header>',
      '<div class="row active nice-padding struct-block object">',
      '<label class="hidden" for="table-block-editor">Table Cell Input</label>',
      '<input class="hidden" id="table-block-editor" maxlength="255" name="title" type="text" value="" class="data-draftail-input">',
      '</div><br>',
      '<div class="row active nice-padding m-t-10">',
      '<label class="hidden" for="table-block-save-btn">Save</label>',
      '<button id="table-block-save-btn" type="button" data-dismiss="modal" class="button">Save Button</button>',
      '</div>'
    ].join( '' );

    // Set body template.
    const MODAL_TEMPLATE = [
      '<div class="table-block-modal fade"',
      'tabindex="-1" role="dialog" aria-hidden="true">',
      '<div class="modal-dialog">',
      '<div class="modal-content">',
      '<label class="hidden" for="close-table-block-modal-btn">Close Modal Button</label>',
      '<button id="close-table-block-modal-btn" type="button" class="button close icon text-replace icon-cross"',
      'data-dismiss="modal" aria-hidden="true">×</button>',
      '<div class="modal-body"></div>',
      '</div>',
      '</div>'
    ].join( '' );

    modalDom = $( MODAL_TEMPLATE );
    modalBodyDom = modalDom.find( '.modal-body' );
    modalBodyDom.html( MODAL_BODY_TEMPLATE );
    bodyDom = $( 'body' );
    bodyDom.find( '.table-block-modal' ).remove();
    bodyDom.append( modalDom );
    modalDom.modal( 'show' );
    saveBtnDom = modalDom.find( '#table-block-save-btn' );
    saveBtnDom.on( 'click', function( event ) {
      modalDom.trigger( 'save-btn:clicked', event );
    } );

    return modalDom;
  }

  /*  createRichTextEditor

      Code copied from
      https://github.com/wagtail/wagtail/blob/master/wagtail/admin/
      static_src/wagtailadmin/js/hallo-bootstrap.js

      Modifications were made to add new form fields to the TableBlock in Wagtail admin and support the rich text editor within table cells.
      TODO: Refactor this code and submit PR to Wagtail repo. */
  function _createRichTextEditor( initialValue ) {
    const id = 'table-block-editor';
    const editor = $( '#' + id ).attr( 'value', JSON.stringify( initialValue ) );

    window.draftail.initEditor(
      '#' + id,
      {
        entityTypes: [
          {
            type: 'LINK',
            icon: 'link',
            description: 'Link',
            attributes: [ 'url', 'id', 'parentId' ],
            whitelist: { href: '^(http:|https:|undefined$)' }
          },
          {
            type: 'DOCUMENT',
            icon: 'doc-full',
            description: 'Document'
          }
        ],
        enableHorizontalRule: false,
        enableLineBreak: false,
        inlineStyles: [
          {
            type: 'BOLD',
            icon: 'bold',
            description: 'Bold'
          },
          {
            type: 'ITALIC',
            icon: 'italic',
            description: 'Italic'
          }
        ],
        blockTypes: [
          {
            label: 'H3',
            type: 'header-three',
            description: 'Heading 3'
          },
          {
            label: 'H4',
            type: 'header-four',
            description: 'Heading 4'
          },
          {
            label: 'H5',
            type: 'header-five',
            description: 'Heading 5'
          },
          {
            type: 'ordered-list-item',
            icon: 'list-ol',
            description: 'Numbered list'
          },
          {
            type: 'unordered-list-item',
            icon: 'list-ul',
            description: 'Bulleted list'
          }
        ]
      },
      document.currentScript
    );

    const html = editor[0];

    return html;
  }

  function makeTableSortable(id) {
    var tableInitialValue = JSON.parse($('#' + id).val());
    if (tableInitialValue && tableInitialValue["columnSorting"]) {
      $('#' + id + '-handsontable-sortable').prop("checked", true)
    }
    $('#' + id + '-handsontable-sortable').on('click', function() {
      var tableValue = JSON.parse($('#' + id).val());
      if (tableValue) {
        tableValue["columnSorting"] = $(this).is(':checked');
        $('#' + id).val(JSON.stringify(tableValue));
      }
    });

    $('#' + id + '-handsontable-header').on('change', function() {
      persistSortable(id);
    });
    $('#' + id + '-handsontable-col-header').on('change', function() {
      persistSortable(id);
    });
    $('#' + id + '-handsontable-col-caption').on('change', function() {
      persistSortable(id);
    });
    window.Handsontable.hooks.add('afterDeselect', function() {
      persistSortable(id);
    });
  }

  function persistSortable(id) {
    var tableValue = JSON.parse($('#' + id).val());
    if (tableValue) {
      tableValue["columnSorting"] = $('#' + id + '-handsontable-sortable').is(':checked');
      $('#' + id).val(JSON.stringify(tableValue));
    }
  }
  window.makeTableSortable = makeTableSortable;
  window.createTableRichTextEditor = createTableRichTextEditor;
  window.setCustomContextMenus = setCustomContextMenus;
})( window );