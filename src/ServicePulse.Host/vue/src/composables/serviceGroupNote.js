import {
  //useFetchFromServiceControl,
  useDeleteFromServiceControl,
 //usePutToServiceControl,
// usePostToServiceControl,
} from "./serviceServiceControlUrls.js";

//delete note by group id
export function useDeleteNote(groupId) {
    return useDeleteFromServiceControl("recoverability/groups/" + groupId+"/comment")
    .then((response) => {
      var result = {
        message: response.ok ? "success" : "error:" + response.statusText,
        status: response.status,
        statusText: response.statusText,
        data: response,
      };
      return result;
    })
    .catch((err) => {
      console.log(err);
      var result = {
        message: "error",
      };
      return result;
    });
}

//edit note by group id
//export function useEditNote(groupId,comment) {
//    return useDeleteFromServiceControl("recoverability/groups/" + groupId + "/comment?comment="+comment)
//        .then((response) => {
//            var result = {
//                message: response.ok ? "success" : "error:" + response.statusText,
//                status: response.status,
//                statusText: response.statusText,
//                data: response,
//            };
//            return result;
//        })
//        .catch((err) => {
//            console.log(err);
//            var result = {
//                message: "error",
//            };
//            return result;
//        });
//}