import { ref } from "vue";

const codeTimer = () => {
  const timer = ref(null);
  const second = ref(0);
  const loading = ref(false);
  const isDisabled = ref(false);

  const startTimer = async (sendSmsCodeApi: Function, time: number) => {
    try {
      isDisabled.value = true;
      clearInterval(timer.value);
      second.value = time;
      timer.value = setInterval(() => {
        second.value--;
        if (second.value <= 0) {
          second.value = 0;
          isDisabled.value = false;
          clearInterval(timer.value);
          timer.value = null;
        }
      }, 1000);

      loading.value = true;
      await sendSmsCodeApi();
    } catch (e) {
      second.value = 0;
      isDisabled.value = false;
      console.log(e);
    } finally {
      loading.value = false;
    }
  };

  const endTimer = () => {
    if (timer.value) {
      clearInterval(timer.value);
      timer.value = null;
    }
    second.value = 0;
    isDisabled.value = false;
    loading.value = false;
  };

  return { second, loading, isDisabled, startTimer, endTimer };
};

export default codeTimer;
