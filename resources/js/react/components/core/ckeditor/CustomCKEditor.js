import React from "react";
import { CKEditor } from "ckeditor4-react";
// import $ from "jquery"

const CustomCKEditor = ({
  type = "classic",
  value,
  style,
  config,
  initData,
  onChange,
}) => {
  // useEffect(() => {
  //   // $('.cke_button__mathjax').on('click', function () {
  //   //   console.log('masuk');
  //     $('body').append("<button>Good</button>")
  //   // });
  // }, [])

  // const handleLoaded = (e) => {
  //   const id = e.editor.container?.$.id;
  //   console.log('asd', e.editor.container?.$.id);
  //   const target = `#${id} .cke_button__mathjax`;
  //   $(target).on('click', function () {
  //     console.log('masuk');
  //     const popupTarget = id.split('cke_editor').pop();
  //     console.log({ popupTarget }, `.cke${popupTarget} .cke_dialog_contents_body`);
  //     setTimeout(() => {
  //       $(`.cke${popupTarget} .cke_dialog_contents_body`).append("<button>Good</button>")
  //     }, 1000);
  //     // $('body').append("<button>Good</button>")
  //   });
  // }

  return (
    <CKEditor
      // onLoaded={handleLoaded}
      type={type}
      initData={initData}
      data={value}
      style={style}
      onChange={({ editor }) => onChange(editor.getData())}
      config={{
        ...config,
        toolbarGroups: [
          { name: "document", groups: ["mode", "document", "doctools"] },
          { name: "clipboard", groups: ["clipboard", "undo"] },
          {
            name: "editing",
            groups: ["find", "selection", "spellchecker", "editing"],
          },
          type == "inline" && '/',
          { name: "forms", groups: ["forms"] },
          { name: "basicstyles", groups: ["basicstyles", "cleanup"] },
          {
            name: "paragraph",
            groups: ["list", "indent", "blocks", "align", "bidi", "paragraph"],
          },
          type == "inline" && '/',
          { name: "links", groups: ["links"] },
          { name: "insert", groups: ["insert"] },
          { name: "styles", groups: ["styles"] },
          { name: "colors", groups: ["colors"] },
          { name: "tools", groups: ["tools"] },
          { name: "others", groups: ["others"] },
          { name: "about", groups: ["about"] },
        ],
        extraPlugins:
          "mathjax,dialogui,dialog,a11yhelp,about,basicstyles,bidi,blockquote,clipboard," +
          "button,panelbutton,panel,floatpanel,colorbutton,colordialog,menu," +
          "contextmenu,dialogadvtab,div,elementspath,enterkey,entities,popup," +
          "filebrowser,find,fakeobjects,floatingspace,listblock,richcombo," +
          "font,format,forms,horizontalrule,htmlwriter,iframe,image,indent," +
          "indentblock,indentlist,justify,link,list,liststyle,magicline," +
          "maximize,newpage,pagebreak,pastefromword,pastetext,preview,print," +
          "removeformat,resize,save,menubutton,scayt,selectall,showblocks," +
          "showborders,smiley,sourcearea,specialchar,stylescombo,tab,table," +
          "tabletools,templates,toolbar,undo," +
          (config?.extraPlugins ?? ""),
        removeButtons:
          "Save,Templates,NewPage,ExportPdf,Preview,Print,Cut,Copy,Find,Replace,SelectAll,Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,CopyFormatting,RemoveFormat,CreateDiv,BidiLtr,BidiRtl,Language,Anchor,Smiley,PageBreak,Iframe,BGColor,TextColor",
        mathJaxLib:
          "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js?config=TeX-AMS_HTML",
      }}
    />
  );
};

export default CustomCKEditor;
