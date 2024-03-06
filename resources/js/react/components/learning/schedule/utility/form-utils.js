export const getQuestionCategoryOptions = (program) => {
  const questionCategories = {
    skd: [
      {
        label: "TWK",
        value: "TWK",
      },
      {
        label: "TIU",
        value: "TIU",
      },
      {
        label: "TKP",
        value: "TKP",
      },
    ],
  };
  return questionCategories[program] ?? [];
};

export const getSubQuestionCategoryOptions = (questionCategory) => {
  const subQuestionCategories = {
    twk: [
      {
        label: "Nasionalisme",
        value: "NASIONALISME",
      },
      {
        label: "Integritas",
        value: "INTEGRITAS",
      },
      {
        label: "Bela Negara",
        value: "BELA_NEGARA",
      },
      {
        label: "Pilar Negara",
        value: "PILAR_NEGARA",
      },
      {
        label: "Bahasa Indonesia",
        value: "BAHASA_INDONESIA",
      },
    ],
    tiu: [
      {
        label: "Verbal Analogi",
        value: "VERBAL_ANALOGI",
      },
      {
        label: "Verbal Silogisme",
        value: "VERBAL_SILOGISME",
      },
      {
        label: "Verbal Analitis",
        value: "VERBAL_ANALITIS",
      },
      {
        label: "Numerik Berhitung",
        value: "NUMERIK_BERHITUNG",
      },
      {
        label: "Numerik Deret",
        value: "NUMERIK_DERET",
      },
      {
        label: "Numerik Perbandingan",
        value: "NUMERIK_PERBANDINGAN",
      },
      {
        label: "Numerik Soal Cerita",
        value: "NUMERIK_SOAL_CERITA",
      },
      {
        label: "Figural Analogi",
        value: "FIGURAL_ANALOGI",
      },
      {
        label: "Figural Serial",
        value: "FIGURAL_SERIAL",
      },
      {
        label: "Figural Ketidaksamaan",
        value: "FIGURAL_KETIDAKSAMAAN",
      },
    ],
    tkp: [
      {
        label: "Pelayanan Publik",
        value: "PELAYANAN_PUBLIK",
      },
      {
        label: "Jejaring Kerja",
        value: "JEJARING_KERJA",
      },
      {
        label: "Sosial Budaya",
        value: "SOSIAL_BUDAYA",
      },
      {
        label: "Profesionalisme",
        value: "PROFESIONALISME",
      },
      {
        label: "TIK",
        value: "TIK",
      },
      {
        label: "Anti Radikalisme",
        value: "ANTI_RADIKALISME",
      },
    ],
  };
  return subQuestionCategories[questionCategory] ?? [];
};

export const getScheduleSessionOptions = () => {
  return [
    {
      label: "1",
      value: "1",
    },
    {
      label: "2",
      value: "2",
    },
    {
      label: "3",
      value: "3",
    },
    {
      label: "4",
      value: "4",
    },
    {
      label: "5",
      value: "5",
    },
    {
      label: "6",
      value: "6",
    },
    {
      label: "7",
      value: "7",
    },
    {
      label: "8",
      value: "8",
    },
    {
      label: "9",
      value: "9",
    },
    {
      label: "10",
      value: "10",
    },
    {
      label: "11",
      value: "11",
    },
    {
      label: "12",
      value: "12",
    },
    {
      label: "13",
      value: "13",
    },
    {
      label: "14",
      value: "14",
    },
    {
      label: "15",
      value: "15",
    },
    {
      label: "16",
      value: "16",
    },
    {
      label: "17",
      value: "17",
    },
    {
      label: "18",
      value: "18",
    },
    {
      label: "19",
      value: "19",
    },
    {
      label: "20",
      value: "20",
    },
    {
      label: "21",
      value: "21",
    },
    {
      label: "22",
      value: "22",
    },
    {
      label: "23",
      value: "23",
    },
    {
      label: "24",
      value: "24",
    },
  ];
};

export const getClassroomFromBlade = () => {
  const dom = document.getElementById("classroom");
  return JSON.parse(dom.innerHTML) ?? null;
};

export const getClassroomId = () => {
  const dom = document.getElementById("classId");
  return dom.innerText;
};

export const backPage = () => {
  window.location.href = `/pembelajaran/jadwal/${getClassroomId()}`;
};
