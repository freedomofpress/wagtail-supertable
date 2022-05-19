import json
import re

from django import forms
from django.utils import translation
from django.utils.functional import cached_property
from django.templatetags.static import static
from django.template.loader import render_to_string

from wagtail.admin.staticfiles import versioned_static
from wagtail.contrib.table_block.blocks import TableBlock, TableInput, TableInputAdapter
from wagtail.utils.widgets import WidgetWithScript
from wagtail.core.rich_text import expand_db_html
from wagtail.core.telepath import register

EXTENDED_TABLE_OPTIONS = {
    "minSpareRows": 0,
    "startRows": 3,
    "startCols": 3,
    "colHeaders": False,
    "rowHeaders": False,
    "contextMenu": [
        "row_above",
        "row_below",
        "---------",
        "col_left",
        "col_right",
        "---------",
        "remove_row",
        "remove_col",
        "---------",
        "undo",
        "redo",
        "---------",
        "alignment",
        "mergeCells",
        "richtext",
        "color",
    ],
    "mergeCells": True,
    "editor": "text",
    "stretchH": "all",
    "height": 108,
    "language": "en-US",
    "renderer": "html",
    "autoColumnSize": False,
}


class RichTextTableInput(WidgetWithScript, TableInput):
    @cached_property
    def media(self):
        tableinput_media = super(RichTextTableInput, self).media
        return forms.Media(
            css=tableinput_media._css,
            js=tableinput_media._js + ['js/table_block.js']
        )

    @staticmethod
    def json_dict_apply(value, callback):
        value = json.loads(value)

        for row in (value or {}).get("data") or []:
            for i, cell in enumerate(row or []):
                if cell:
                    row[i] = callback(cell)

        return json.dumps(value)


class RichTextTableInputAdapter(TableInputAdapter):
    js_constructor = 'wagtail.widgets.RichTextTableInput'


register(RichTextTableInputAdapter(), RichTextTableInput)


class ExtendedTableBlock(TableBlock):
    @cached_property
    def field(self):
        widget = RichTextTableInput(table_options=self.table_options)
        return forms.CharField(widget=widget, **self.field_options)

    def get_table_options(self, table_options=None):
        """
        Return a dict of table options using the defaults unless custom options provided
        table_options can contain any valid handsontable options:
        https://handsontable.com/docs/6.2.2/Options.html
        contextMenu: if value from table_options is True, still use default
        language: if value is not in table_options, attempt to get from envrionment
        """

        collected_table_options = EXTENDED_TABLE_OPTIONS.copy()

        if table_options is not None:
            if table_options.get("contextMenu", None) is True:
                # explicity check for True, as value could also be array
                # delete to ensure the above default is kept for contextMenu
                del table_options["contextMenu"]
            collected_table_options.update(table_options)

        if "language" not in collected_table_options:
            # attempt to gather the current set language of not provided
            language = translation.get_language()
            collected_table_options["language"] = language

        return collected_table_options

    class Meta:
        template = "table.html"
