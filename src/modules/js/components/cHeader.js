import Component from "~/parentClass/Component";

//
// main
//

export default class CHeader extends Component {
  static componentName = "cHeader";
  static isPermanent = true;

  onInit() {
    this.toggleButton = this.el.querySelector("[data-toggle]");
    this.selectBox = this.el.querySelector("[data-select]");

    document.body.classList.add("-light");
    this.toggleButton.addEventListener("change", () => {
      if (this.toggleButton.checked == true) {
        document.body.classList.add("-dark");
        document.body.classList.remove("-light");
      } else {
        document.body.classList.remove("-dark");
        document.body.classList.add("-light");
      }
    });
    this.selectBox.addEventListener("change", function() {
      console.log(this.value)
      if(this.value === "Sans serif") {
        document.body.classList.add("-sans-serif");
        document.body.classList.remove("-serif");
        document.body.classList.remove("-mono");
      }
      if(this.value === "Serif") {
        document.body.classList.remove("-sans-serif");
        document.body.classList.add("-serif");
        document.body.classList.remove("-mono");
      }
      if(this.value === "Mono") {
        document.body.classList.remove("-sans-serif");
        document.body.classList.remove("-serif");
        document.body.classList.add("-mono");
      }
    })
  }
}
