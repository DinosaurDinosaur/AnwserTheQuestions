(function () {
  var stopBodyScroll = null;
  const correctAnswers = {
    q1: '5',
    q2: '4',
    q3: '1',
    q4: '6',
    q5: '5',
  };
  let currentQuestion = 1;
  const totalQuestions = 10;
  var questionIndex = 1;

  $(window).on('load', function () {
    stopBodyScroll = initBodyScroller();

    // loading
    setTimeout(function () {
      $('.loading').fadeOut(500);
    }, 800);

    // 金幣動態
    setTimeout(function () {
      $('.money-L1').addClass('active');
    }, 1500);
    setTimeout(function () {
      $('.money-R1').addClass('active');
    }, 1600);
    setTimeout(function () {
      $('.money-R2').addClass('active');
    }, 1600);

    // wow.js init
    var wow = new WOW({});
    wow.init();
  });

  $(function () {
    setGoTop();

    // 初始化頁面
    updateQuestionVisibility();

    // 下一頁按鈕點擊事件
    $('.next').on('click', function () {
      if (currentQuestion < totalQuestions) {
        currentQuestion++;
        questionIndex++;
        updateQuestionVisibility();
      }
    });

    // 上一頁按鈕點擊事件
    $('.prev').on('click', function () {
      if (currentQuestion > 1) {
        currentQuestion--;
        questionIndex--;
        updateQuestionVisibility();
      }
    });

    // 送出按鈕點擊事件
    $('.submit').on('click', function () {
      const formData = collectFormData();
      console.log(formData); // 得到作答完的資料
      showPopup('#popup-win');
      // showPopup('#popup-lost');

      // 傳送作答完的資料
      // ajax_api(
      //   'https://fbs-anti-fraud.ozo-studio.com/questionnaire-save',
      //   formData,
      //   function (res) {
      //     console.log(res);
      //     // if (res.result) {
      //     //   console.log(res.msg);
      //     //   showPopup();
      //     // } else {
      //     //   console.log(res.msg);
      //     // }
      //   }
      // );
    });

    // 監聽每個 radio button 的變化
    $('input:radio').change(function () {
      const questionName = $(this).attr('name');
      const selectedValue = $(this).val();

      // 檢查當前選擇是否正確
      if (
        correctAnswers[questionName] !== undefined &&
        selectedValue !== correctAnswers[questionName]
      ) {
        alert('好像不太對...請再想想吧！');
      }

      // 檢查所有問題是否都已選擇並且選擇正確
      checkAllAnswers();

      // 如果已選擇答案，啟用下一頁按鈕
      if ($(`input:radio[name=${questionName}]:checked`).length > 0) {
        $('.next').attr('disabled', false);
      }
    });

    // 頁面初始化時禁用下一頁按鈕
    $('.next').attr('disabled', true);
  });

  // 更新問題的顯示與隱藏
  function updateQuestionVisibility() {
    $('.question').removeClass('active');
    $(`.question-${currentQuestion}`).addClass('active');
    updateBackgroundImage();
    updateProgressBar();

    $('.prev').toggle(currentQuestion > 1);
    $('.next')
      .toggle(currentQuestion < totalQuestions)
      .attr('disabled', true);
    $('.submit').toggle(currentQuestion === totalQuestions);

    // 如果當前問題已選擇答案，啟用下一頁按鈕
    const selectedValue = $(
      `input:radio[name=q${currentQuestion}]:checked`
    ).val();
    if (selectedValue !== undefined) {
      $('.next').attr('disabled', false);
    }
  }

  // 更新問題的題號
  function updateBackgroundImage() {
    var imagePath = '../images/q' + questionIndex + '.png';
    $('.question-num').css('background-image', 'url(' + imagePath + ')');
  }

  // 更新進度條的顯示狀態
  function updateProgressBar() {
    $('.progress-bar-num').removeClass('active');
    $(`.no${currentQuestion}`).addClass('active');
  }

  // 檢查所有問題是否都已選擇並且選擇正確的函數
  function checkAllAnswers() {
    let allCorrect = true;
    for (const [question, answer] of Object.entries(correctAnswers)) {
      const selectedValue = $(`input:radio[name=${question}]:checked`).val();
      if (selectedValue === undefined || selectedValue !== answer) {
        allCorrect = false;
        break;
      }
    }

    // 檢查第6題到第10題是否都已選擇
    let allAnswered = true;
    for (let i = 6; i <= 10; i++) {
      const selectedValue = $(`input:radio[name=q${i}]:checked`).val();
      if (selectedValue === undefined) {
        allAnswered = false;
        break;
      }
    }

    // 根據答案的正確性來啟用或禁用送出按鈕
    $('.submit').attr('disabled', !(allCorrect && allAnswered));
  }

  // 收集表單數據的函數
  function collectFormData() {
    const formData = {};
    for (let i = 1; i <= totalQuestions; i++) {
      const value = $(`input:radio[name=q${i}]:checked`).val();
      formData[`q${i}`] = value;
    }
    return formData;
  }

  // API串接 傳作答完的資料給後端
  function ajax_api(path, formdata, callback) {
    var datas = formdata || {};
    $.ajax({
      url: path,
      cache: false,
      dataType: 'json',
      type: 'POST',
      data: datas,
      success: function (res) {
        callback && typeof callback === 'function' && callback(res);
      },
      error: function (res) {
        console.log(res);
        callback && typeof callback === 'function' && callback(false);
      },
    });
  }

  // 顯示popup
  function showPopup(ele) {
    stopBodyScroll.fixedBody();
    $(ele).stop().fadeIn().scrollTop(0);
    // $(ele).addClass('active'); // 用新增active來控制popup顯示
  }

  // 關閉popup
  function closePopup(ele) {
    stopBodyScroll.scrollBody();
    $(ele).hide();
    // $(ele).removeClass('active'); // 用刪除active來控制popup隱藏
  }

  function setGoTop() {
    $('.gotop').on('click', function () {
      $('html, body').stop().animate({ scrollTop: 0 }, 500);
    });
  }

  // 防止背景滑動
  function initBodyScroller() {
    var StopBodyScroll = (function () {
      var instance = null;
      function StopBodyScroll() {
        this.pageTop = 0;
        this.body = document.body;
        this.html = document.getElementById('main-html');
      }
      StopBodyScroll.prototype.fixedBody = function () {
        this.pageTop = window.scrollY;
        this.html.style.height = window.screen.availHeight + 'px';
        this.body.style.position = 'fixed';
        this.body.style.top = -this.pageTop + 'px';
        this.body.style.overflow = 'hidden';
      };
      StopBodyScroll.prototype.scrollBody = function () {
        this.html.style.height = 'auto';
        this.body.style.position = '';
        this.body.style.top = '';
        this.body.style.overflowX = 'auto';
        this.body.style.overflowY = 'scroll';
        window.scrollTo(0, this.pageTop);
      };
      return function () {
        if (!instance) {
          instance = new StopBodyScroll();
        }

        return instance;
      };
    })();
    return new StopBodyScroll();
  }
})();
