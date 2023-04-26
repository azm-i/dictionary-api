import Component from "~/parentClass/Component";

//
// main
//

export default class LForm extends Component {
  static selectorRoot = "[data-form]";

  onInit() {
    this.form = this.el.querySelector("[data-form-search]");
    this.contents = this.el.querySelector("[data-form-contents]");
    this.button = this.el.querySelector("[data-form-search-button]");
    this.word = this.el.querySelector("[data-form-search-textbox]");
    let url;
    this.links = [...this.el.querySelectorAll("[data-form-word-link]")];
    this.links.forEach((item) => {
      item.addEventListener("click", () => {
        url =
          "https://api.dictionaryapi.dev/api/v2/entries/en/" + item.innerHTML;
      });
    });
    const postFetch = async (url) => {
      let response = await fetch(url);

      if (response.ok) {
        let json = await response.json();
        console.log(json);
        while (this.contents.firstChild) {
          this.contents.removeChild(this.contents.firstChild);
        }
        json.forEach((item) => {
          const result = document.createElement("div");
          this.contents.appendChild(result);
          result.className = "lForm-result";
          const words = document.createElement("div");
          result.appendChild(words);
          words.className = "lForm-words";
          const words_text = document.createElement("div");
          words.appendChild(words_text);
          words_text.className = "lForm-words-text";
          const keyword = document.createElement("h2");
          words_text.appendChild(keyword);
          keyword.className = "lForm-keyword";
          keyword.textContent = item.word;
          if (item.phonetics) {
            item.phonetics.forEach((item, i) => {
              if (i === 0) {
                const phonetic = document.createElement("p");
                words_text.appendChild(phonetic);
                phonetic.className = "lForm-phonetic";
                phonetic.textContent = item.text;
                if (item.audio) {
                  const play = document.createElement("audio");
                  play.setAttribute("src", item.audio);
                  words.appendChild(play);
                  play.className = "lForm-play";
                  const button = document.createElement("button");
                  words.appendChild(button);
                  button.className = "lForm-button";
                }
              }
            });
          }
          const description = document.createElement("div");
          result.appendChild(description);
          description.className = "lForm-description";
          if (item.meanings) {
            item.meanings.forEach((item) => {
              const part = document.createElement("div");
              description.appendChild(part);
              part.className = "lForm-part";
              const part_title = document.createElement("h3");
              part.appendChild(part_title);
              part_title.className = "lForm-part-title";
              part_title.textContent = item.partOfSpeech;
              const part_lead = document.createElement("h4");
              part.appendChild(part_lead);
              part_lead.className = "lForm-part-lead";
              part_lead.textContent = "Meaning";
              const part_list = document.createElement("ul");
              part.appendChild(part_list);
              part_list.className = "lForm-part-list";
              item.definitions.forEach((item) => {
                const part_item = document.createElement("li");
                part_list.appendChild(part_item);
                part_item.className = "lForm-part-item";
                const part_item_text = document.createElement("p");
                part_item.appendChild(part_item_text);
                part_item_text.className = "lForm-part-item-text";
                part_item_text.textContent = item.definition;
                if (item.example) {
                  const part_item_example = document.createElement("p");
                  part_item.appendChild(part_item_example);
                  part_item_example.className = "lForm-part-item-example";
                  part_item_example.textContent = "“" + item.example + "”";
                }
                if (item.synonyms.length > 0) {
                  const part_item_synonyms = document.createElement("div");
                  part_item.appendChild(part_item_synonyms);
                  part_item_synonyms.className = "lForm-part-item-synonyms";
                  const part_item_synonyms_lead = document.createElement("h6");
                  part_item_synonyms.appendChild(part_item_synonyms_lead);
                  part_item_synonyms_lead.className =
                    "lForm-part-item-synonyms-lead";
                  part_item_synonyms_lead.textContent = "Synonyms";
                  const part_item_synonyms_words = document.createElement(
                    "div"
                  );
                  part_item_synonyms.appendChild(part_item_synonyms_words);
                  part_item_synonyms_words.className =
                    "lForm-part-item-synonyms-words";
                  item.synonyms.forEach((item) => {
                    const part_item_synonyms_word = document.createElement("a");
                    part_item_synonyms_words.appendChild(
                      part_item_synonyms_word
                    );
                    part_item_synonyms_word.className =
                      "lForm-part-item-synonyms-word";
                    part_item_synonyms_word.textContent = item;
                    part_item_synonyms_word.setAttribute(
                      "data-form-word-link",
                      ""
                    );
                  });
                }
                if (item.antonyms.length > 0) {
                  const part_item_antonyms = document.createElement("div");
                  part_item.appendChild(part_item_antonyms);
                  part_item_antonyms.className = "lForm-part-item-antonyms";
                  const part_item_antonyms_lead = document.createElement("h6");
                  part_item_antonyms.appendChild(part_item_antonyms_lead);
                  part_item_antonyms_lead.className =
                    "lForm-part-item-antonyms-lead";
                  part_item_antonyms_lead.textContent = "Antonyms";
                  const part_item_antonyms_words = document.createElement(
                    "div"
                  );
                  part_item_antonyms.appendChild(part_item_antonyms_words);
                  part_item_antonyms_words.className =
                    "lForm-part-item-antonyms-words";
                  item.antonyms.forEach((item) => {
                    const part_item_antonyms_word = document.createElement("a");
                    part_item_antonyms_words.appendChild(
                      part_item_antonyms_word
                    );
                    part_item_antonyms_word.className =
                      "lForm-part-item-antonyms-word";
                    part_item_antonyms_word.textContent = item;
                    part_item_antonyms_word.setAttribute(
                      "data-form-word-link",
                      ""
                    );
                  });
                }
              });
              if (item.synonyms.length > 0) {
                const part_synonyms = document.createElement("div");
                part.appendChild(part_synonyms);
                part_synonyms.className = "lForm-part-synonyms";
                const part_synonyms_lead = document.createElement("h5");
                part_synonyms.appendChild(part_synonyms_lead);
                part_synonyms_lead.className = "lForm-part-synonyms-lead";
                part_synonyms_lead.textContent = "Synonyms";
                const part_synonyms_words = document.createElement("div");
                part_synonyms.appendChild(part_synonyms_words);
                part_synonyms_words.className = "lForm-part-synonyms-words";
                item.synonyms.forEach((item) => {
                  const part_synonyms_word = document.createElement("a");
                  part_synonyms_words.appendChild(part_synonyms_word);
                  part_synonyms_word.className = "lForm-part-synonyms-link";
                  part_synonyms_word.textContent = item;
                  part_synonyms_word.setAttribute("data-form-word-link", "");
                });
              }
              if (item.antonyms.length > 0) {
                const part_antonyms = document.createElement("div");
                part.appendChild(part_antonyms);
                part_antonyms.className = "lForm-part-antonyms";
                const part_antonyms_lead = document.createElement("h5");
                part_antonyms.appendChild(part_antonyms_lead);
                part_antonyms_lead.className = "lForm-part-antonyms-lead";
                part_antonyms_lead.textContent = "Antonyms";
                const part_antonyms_words = document.createElement("div");
                part_antonyms.appendChild(part_antonyms_words);
                part_antonyms_words.className = "lForm-part-antonyms-words";
                item.antonyms.forEach((item) => {
                  const part_antonyms_word = document.createElement("a");
                  part_antonyms_words.appendChild(part_antonyms_word);
                  part_antonyms_word.className = "lForm-part-antonyms-link";
                  part_antonyms_word.textContent = item;
                  part_antonyms_word.setAttribute("data-form-word-link", "");
                });
              }
            });
          }
          if (item.sourceUrls) {
            const source = document.createElement("div");
            result.appendChild(source);
            source.className = "lForm-source";
            const source_lead = document.createElement("h5");
            source.appendChild(source_lead);
            source_lead.className = "lForm-source-lead";
            source_lead.textContent = "Source";
            const source_links = document.createElement("div");
            source.appendChild(source_links);
            source_links.className = "lForm-source-links";
            item.sourceUrls.forEach((item) => {
              const source_link = document.createElement("a");
              source_links.appendChild(source_link);
              source_link.className = "lForm-source-link";
              source_link.textContent = item;
              source_link.setAttribute("href", item);
              source_link.setAttribute("target", "_blank");
              const source_icon = document.createElement("span");
              source_links.appendChild(source_icon);
              source_icon.className = "lForm-source-icon";
            });
          }
        });
        const audios = [...document.querySelectorAll(".lForm-play")];
        audios.forEach((item, i) => {
          item.setAttribute("id", `audio${i}`);
        });
        const buttons = [...document.querySelectorAll(".lForm-button")];
        buttons.forEach((item, i) => {
          item.setAttribute(
            "onclick",
            `document.getElementById('audio${i}').play()`
          );
        });
        this.links = [...this.el.querySelectorAll("[data-form-word-link]")];
        this.links.forEach((item) => {
          item.addEventListener("click", () => {
            url =
              "https://api.dictionaryapi.dev/api/v2/entries/en/" +
              item.innerHTML;
            postFetch(url);
            this.word.value = item.innerHTML;
          });
        });
      } else {
        while (this.contents.firstChild) {
          this.contents.removeChild(this.contents.firstChild);
        }
        const result = document.createElement("div");
        this.contents.appendChild(result);
        result.className = "lForm-result";
        const notfound = document.createElement("div");
        result.appendChild(notfound);
        notfound.className = "lForm-notfound";
        const notfound_emoji = document.createElement("div");
        notfound.appendChild(notfound_emoji);
        notfound_emoji.className = "lForm-notfound-emoji";
        notfound_emoji.textContent = "😕";
        const notfound_lead = document.createElement("h2");
        notfound.appendChild(notfound_lead);
        notfound_lead.className = "lForm-notfound-lead";
        notfound_lead.textContent = "No Definitions Found";
        const notfound_text = document.createElement("p");
        notfound.appendChild(notfound_text);
        notfound_text.className = "lForm-notfound-text";
        notfound_text.textContent =
          "Sorry pal, we couldn't find definitions for the word you were looking for. You can try the search again at later time or head to the web instead.";
      }
    };
    this.button.addEventListener("click", () => {
      if (
        this.word.value.length === 0 &&
        document.querySelector(".lForm-search-empty") === null
      ) {
        this.word.classList.add("-empty");
        const search_empty = document.createElement("p");
        this.form.appendChild(search_empty);
        search_empty.className = "lForm-search-empty";
        search_empty.textContent = "Whoops, can’t be empty…";
        return;
      } else if (
        this.word.value.length !== 0 &&
        document.querySelector(".lForm-search-empty") !== null
      ) {
        const search_empty = document.querySelector(".lForm-search-empty");
        console.log(search_empty);
        this.word.classList.remove("-empty");
        search_empty.remove();
      } else if (
        this.word.value.length === 0 &&
        document.querySelector(".lForm-search-empty") !== null
      ) {
        return;
      }
      url =
        "https://api.dictionaryapi.dev/api/v2/entries/en/" + this.word.value;
      postFetch(url);
    });
    this.word.onkeypress = (e) => {
      const key = e.keyCode || e.charCode || 0;
      if (key == 13) {
        if (
          this.word.value.length === 0 &&
          document.querySelector(".lForm-search-empty") === null
        ) {
          this.word.classList.add("-empty");
          const search_empty = document.createElement("p");
          this.form.appendChild(search_empty);
          search_empty.className = "lForm-search-empty";
          search_empty.textContent = "Whoops, can’t be empty…";
          return;
        } else if (
          this.word.value.length !== 0 &&
          document.querySelector(".lForm-search-empty") !== null
        ) {
          const search_empty = document.querySelector(".lForm-search-empty");
          console.log(search_empty);
          this.word.classList.remove("-empty");
          search_empty.remove();
        } else if (
          this.word.value.length === 0 &&
          document.querySelector(".lForm-search-empty") !== null
        ) {
          return;
        }
        url =
          "https://api.dictionaryapi.dev/api/v2/entries/en/" + this.word.value;
        postFetch(url);
      }
    };
  }
}
