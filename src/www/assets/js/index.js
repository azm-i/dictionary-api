import Page from "~/parentClass/Page";
import LForm from "~/pages/index/lForm";

//
// main
//

class PageCurrent extends Page {
  onInit() {
    this.lForm = new LForm();
  }
}
new PageCurrent();
