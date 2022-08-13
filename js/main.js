document.addEventListener("DOMContentLoaded", mainProcess);

function mainProcess() {
  const btnNext = document.querySelectorAll('[data-nav="next"]');
  const btnPrev = document.querySelectorAll('[data-nav="prev"]');
  const radioGroup = document.querySelectorAll(".radio-group");
  const checkboxGroup = document.querySelectorAll(
    'label.checkbox-block input[type="checkbox"]'
  );
  const popup = document.getElementById("popup");
  const popup2 = document.getElementById("popup2");

  //Оверлей вынес наверх, т.к. я с ним работаю и в попапах и в прелоадере
  const overlay = document.querySelector(".overlay");

  const answers = {};

  //Из за прогрузки дома, мне нужно вынести глобально answers,что бы обращаться в консоли
  window.answers = answers;

  function navigate(type, thisCard) {
    const thisCardNum = parseInt(thisCard.dataset.card);
    let nextCard;

    if (type == "next") {
      nextCard = thisCardNum + 1;
    } else {
      nextCard = thisCardNum - 1;
    }

    thisCard.classList.add("hide");
    document
      .querySelector(`[data-card="${nextCard}"]`)
      .classList.remove("hide");
  }

  function gatherCardData(number) {
    const currentCard = document.querySelector(`[data-card="${number}"]`);
    const question = currentCard.querySelector("[data-question]").innerText;
    const radioGroup = currentCard.querySelectorAll("[type='radio']");
    const checkboxGroup = currentCard.querySelectorAll("[type='checkbox']");
    const inpGroup = currentCard.querySelectorAll(
      "[type='email'], [type='number'], [type='text']"
    );

    const result = [];
    const data = {
      question: question,
      answer: result,
    };

    //Вынес для удобства в функцию повторяющиеся пуши результата
    function resultPush(el) {
      result.push({
        name: el.name,
        value: el.value,
      });
    }

    radioGroup.forEach((el) => {
      if (el.checked) {
        resultPush(el);
      }
    });

    checkboxGroup.forEach((el) => {
      if (el.checked) {
        resultPush(el);
      }
    });

    inpGroup.forEach((el) => {
      if (el.value.trim() != "") {
        resultPush(el);
      }
    });

    return data;
  }

  function saveDev(number, data) {
    answers[number] = data;
  }

  function isField(number) {
    if (answers[number].answer.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  function validateEmail(email) {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  }

  function checkOnRequire(number) {
    const currentCard = document.querySelector(`[data-card="${number}"]`);
    const requiredItems = currentCard.querySelectorAll("[required]");

    const isValidate = [];

    requiredItems.forEach((el) => {
      if (el.type == "checkbox" && el.checked == false) {
        isValidate.push(false);
      } else if (el.type == "email") {
        if (validateEmail(el.value)) {
          isValidate.push(true);
        } else {
          isValidate.push(false);
        }
      }
    });

    if (isValidate.indexOf(false) == -1) {
      return true;
    } else {
      return false;
    }
  }

  //Функция добавления модальных окон. (Сами модалки внизу html)
  function modal(number, modal) {
    const currentCard = document.querySelector(`[data-card="${number}"]`);
    const modalClose = modal.querySelector(".popup_close");

    if (currentCard.hasAttribute("data-modal")) {
      modal.classList.add("open");
      overlay.classList.add("open");
    }

    modalClose.addEventListener("click", (e) => {
      modal.classList.remove("open");
      overlay.classList.remove("open");
      currentCard.removeAttribute("data-modal");
    });

    overlay.addEventListener("click", (e) => {
      modal.classList.remove("open");
      overlay.classList.remove("open");
      currentCard.removeAttribute("data-modal");
    });
  }

  //Функция добавления прелоадера (Сам прелоад находится в 5 карточке)
  function preload(thisCard) {
    const preload = document.getElementById("prloader");

    preload.classList.remove("preloader-hidden");
    overlay.classList.add("open");

    setTimeout(function () {
      navigate("next", thisCard);
      preload.classList.add("preloader-hidden");
      overlay.classList.remove("open");
    }, 1500);
  }

  function updateProgressBar(direction, cardNum) {
    const cardTotalNumber = document.querySelectorAll("[data-card]").length;

    direction == "next" ? (cardNum = cardNum + 1) : (cardNum = cardNum - 1);

    const percent = ((cardNum * 100) / cardTotalNumber).toFixed(0);
    const currentCard = document.querySelector(`[data-card="${cardNum}"]`);
    const progressBar = currentCard.querySelector(".progress__label strong");

    if (progressBar != null) {
      progressBar.innerText = `${percent}%`;
      currentCard.querySelector(
        ".progress__line-bar"
      ).style = `width: ${percent}%`;
    }
  }

  btnNext.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const thisCard = this.closest("[data-card]");
      const thisCardNum = parseInt(thisCard.dataset.card);

      //Если нам не надо валидировать карточку, идем дальше
      if (thisCard.dataset.validate == "novalidate") {
        navigate("next", thisCard);
        updateProgressBar("next", thisCardNum);
      } else {
        //Если нам надо валидировать карточку, тогда:

        saveDev(thisCardNum, gatherCardData(thisCardNum));

        //Проверяем, заполнили ли валидацию верно, если заполнили верно:
        if (isField(thisCardNum) && checkOnRequire(thisCardNum)) {
          //Удаляем data-modal, которое остается на странице после закрытия модального окна.
          thisCard.removeAttribute("data-modal");

          //Проверяем находимся ли мы на карточке (data-load), если находимся, тогда:
          if (
            thisCardNum == document.querySelector("[data-load]").dataset.card
          ) {
            //Запускаем прелоадер, передавая ему текущую карточку
            preload(thisCard);
          } else {
            //Если мы не находимся на карточке в которой нужен прелоадер, тогда просто идем дальше, к следующим карточкам
            navigate("next", thisCard);
            updateProgressBar("next", thisCardNum);
          }
        } else {
          //Если все таки мы заполнили валидацию НЕВЕРНО! тогда:

          //Добавляем атрибут data-modal
          thisCard.setAttribute("data-modal", "");

          //Проверяем, если мы находимся на карточке в которой нужно поставить галочку о соглашении конфедициальности и заполнением емайла, тогда:
          if (
            thisCardNum ==
            document.querySelector("[data-confendicality]").dataset.card
          ) {
            //Для такой карточки добавляем другой попап
            modal(thisCardNum, popup2);
          } else {
            //В остальных случаях, просто добавляем обычный попап
            modal(thisCardNum, popup);
          }
        }
      }
    });
  });

  btnPrev.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const thisCard = this.closest("[data-card]");
      const thisCardNum = thisCard.dataset.card;
      navigate("prev", thisCard);
      updateProgressBar("prev", thisCardNum);
    });
  });

  radioGroup.forEach((items) => {
    items.addEventListener("click", (e) => {
      const label = e.target.closest("label");

      if (label) {
        label
          .closest(".radio-group")
          .querySelectorAll("label")
          .forEach((el) => {
            el.classList.remove("radio-block--active");
          });

        label.classList.add("radio-block--active");
      }
    });
  });

  checkboxGroup.forEach((el) => {
    el.addEventListener("change", (e) => {
      if (el.checked) {
        el.closest("label").classList.add("checkbox-block--active");
      } else {
        el.closest("label").classList.remove("checkbox-block--active");
      }
    });
  });
}
