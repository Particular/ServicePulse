import { useCookies } from "vue3-cookies";

const cookies = useCookies().cookies;

export class useSortingsAndGroupClassifiers {
  getSortOptions() {
    return [
      {
        description: "Name",
        selector: function (group) {
          return group.title;
        },
      },
      {
        description: "Number of messages",
        selector: function (group) {
          return group.count;
        },
      },
      {
        description: "First Failed Time",
        selector: function (group) {
          return group.first;
        },
      },
      {
        description: "Last Failed Time",
        selector: function (group) {
          return group.last;
        },
      },
      {
        description: "Last Retried Time",
        selector: function (group) {
          return group.last_operation_completion_time;
        },
      },
    ];
  }

  saveSortOption(sortCriteria, sortDirection) {
    cookies.set("sortCriteria", sortCriteria);
    cookies.set("sortDirection", sortDirection);
  }

  loadSavedSortOption() {
    let criteria = cookies.get("sortCriteria");
    let direction = cookies.get("sortDirection");

    if (criteria && direction) {
      var sortBy = this.getSortOptions().find((sort) => {
        return sort.description.toLowerCase() === criteria.toLowerCase();
      });
      return { sort: this.getSortFunction(sortBy.selector, direction), dir: direction, description: sortBy.description };
    }

    return { sort: (firstElement, secondElement) => {return firstElement.title < secondElement.title ? -1 : 1; }, dir: "asc", description: "Name" };
  }

  getSortFunction(selector, dir) {
    return (firstElement, secondElement) => {
      if (dir === "asc") {
        return selector(firstElement) < selector(secondElement) ? -1 : 1;
      } else {
        return selector(firstElement) < selector(secondElement) ? 1 : -1;
      }
    };
  }
}
