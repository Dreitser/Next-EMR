import axios from "axios";

const baseUrl = "https://fhir-lex.preview.canvasmedical.com";

const options = {
  headers: {
    accept: "application/json",
    Authorization: "Bearer c63f87ccc65e4f88b72130f2da90012f",
  },
};

export const patientSearch = () => {
  const url = `${baseUrl}/Patient`;
  return axios
    .get(url, options)
    .then((res) => {
      return res.data.entry.map((entry) => {
        const { resource } = entry;
        const { id, gender, birthDate, active } = resource;
        const name = !!resource.name?.length ? resource.name[0] : {};
        const telecom = !!resource.telecom?.length ? resource.telecom[0] : {};

        return {
          id,
          firstName: name.given?.join("") ?? "",
          lastName: name.family,
          phone: telecom.value,
          gender,
          birthDate,
          active,
        };
      });
    })
    .catch((err) => console.error(err));
};

export const patientCreate = (payload) => {
  const body = {
    resourceType: "Patient",
    extension: [
      {
        url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex",
        valueCode: "M",
      },
    ],
    active: true,
    name: [
      {
        use: "official",
        family: payload.lastName,
        given: [payload.firstName],
      },
    ],
    gender: payload.gender === "M" ? "male" : "female",
    birthDate: moment(payload.birthDate).format("YYYY-MM-DD"),
  };
  const url = `${baseUrl}/Patient`;
  return axios
    .post(url, body, options)
    .then((res) => {
      console.log("create-res");
    })
    .catch((err) => console.error(err));
};
