// import Uppy from "@uppy/core";
// import { DragDrop } from "@uppy/react";
// import { File, Image, X } from "react-feather";
// import { Card, CardBody, Media } from "reactstrap";
// import "uppy/dist/uppy.css";

// import Avatar from "../avatar";
// import { useFileUpload } from "../../../hooks/useFileUpload";

// const FileUpload = ({ isMultiple = false }) => {
//   const { handleSelectedFile, handleRemoveFile, previews } =
//     useFileUpload(isMultiple);

//   const uppyOptions = isMultiple
//     ? {
//         allowMultipleUploads: true,
//       }
//     : {
//         restrictions: { maxNumberOfFiles: 1 },
//       };

//   const uppy = new Uppy({
//     meta: { type: "avatar" },
//     ...uppyOptions,
//     onBeforeFileAdded: (currentFile, files) => {
//       console.log({files});
//       handleSelectedFile(currentFile);
//     },
//   });

//   return (
//     <>
//       {previews.length === 0 && <DragDrop uppy={uppy} />}
//       {previews.length > 0 && (
//         <Card className="card-transaction mt-25">
//           <CardBody>
//             {previews.map((item, itemIndex) => (
//               <div key={item.id} className="transaction-item">
//                 <Media>
//                   <Avatar
//                     className="rounded"
//                     color={item.color}
//                     icon={
//                       item.icon === "image" ? (
//                         <Image size={18} />
//                       ) : (
//                         <File size={18} />
//                       )
//                     }
//                   />
//                   <Media body>
//                     <h6 className="transaction-title">{item.name}</h6>
//                     <small>{item.type}</small>
//                   </Media>
//                 </Media>
//                 <div className="text-danger">
//                   <X size={18} onClick={() => handleRemoveFile(itemIndex)} />
//                 </div>
//               </div>
//             ))}
//           </CardBody>
//         </Card>
//       )}
//     </>
//   );
// };

// export default FileUpload;
