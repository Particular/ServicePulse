import { useCookies } from "vue3-cookies";
import { useFetchFromServiceControl } from "./serviceServiceControlUrls";

export class useFailedMessageGroupClassification {
  getGroupingClassifiers() {
    return useFetchFromServiceControl("recoverability/classifiers").then((response) => {
      return response.json();
    });
  }

  loadDefaultGroupingClassifier(router) {
    let urlGrouping = router.query.groupBy;

    if (urlGrouping) {
      this.saveDefaultGroupingClassifier(urlGrouping);
      return urlGrouping;
    }

    const cookies = useCookies().cookies;
    let cookieGrouping = cookies.get("failed_groups_classification");

    if (cookieGrouping) {
      return cookieGrouping;
    }

    return null;
  }

  saveDefaultGroupingClassifier(classifier) {
    const cookies = useCookies().cookies;
    cookies.set("failed_groups_classification", classifier);
  }
}
