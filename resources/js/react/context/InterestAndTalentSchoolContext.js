import { createContext, useState } from "react";
import {
  getSchoolAdminBySchoolId,
  getSchoolById,
} from "../data/interest-and-talent/school/school-data";
import { getProvinces, getRegions } from "../data/location-data";

export const InterestAndTalentSchoolContext = createContext({
  isSchoolModalOpen: false,
  toggleSchoolModalVisibility: () => {},

  isAddNewSchoolAdminModalOpen: false,
  toggleAddNewSchoolAdminModalVisibility: () => {},

  isAssignNewAccessCodeModalOpen: false,
  toggleAssignNewAccessCodeModalVisibility: () => {},

  isAssignedAccessCodeModalOpen: false,
  toggleAssignedAccessCodeModalVisibility: () => {},

  isAssignedUpdateAccessCodeModalOpen: false,
  toggleAssignedUpdateAccessCodeModalVisibility: () => {},

  highSchools: [],
  isFetchingHighSchools: false,
  setHighSchools: () => {},
  setIsFetchingHighSchools: () => {},

  provinces: [],
  fetchProvinces: async () => {},

  regions: [],
  isFetchingRegions: false,
  fetchRegions: async (province_id) => {},

  school: null,
  isFetchingSchool: false,
  fetchSchool: async (school_id) => {},

  schoolAdmins: [],
  isFetchingSchoolAdmins: false,
  fetchSchoolAdmins: async (school_id) => {},

  showPassword: false,
  togglePasswordVisibility: () => {},
});

const InterestAndTalentSchoolContextProvider = (props) => {
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const toggleSchoolModalVisibility = () => {
    setIsSchoolModalOpen(!isSchoolModalOpen);
  };

  const [isAddNewSchoolAdminModalOpen, setIsAddNewSchoolAdminModalOpen] =
    useState(false);
  const toggleAddNewSchoolAdminModalVisibility = () => {
    setIsAddNewSchoolAdminModalOpen(!isAddNewSchoolAdminModalOpen);
  };

  const [isAssignNewAccessCodeModalOpen, setIsAssignNewAccessCodeModalOpen] =
    useState(false);
  const toggleAssignNewAccessCodeModalVisibility = () => {
    setIsAssignNewAccessCodeModalOpen(!isAssignNewAccessCodeModalOpen);
  };

  const [isAssignedAccessCodeModalOpen, setIsAssignedAccessCodeModalOpen] =
    useState(false);
  const toggleAssignedAccessCodeModalVisibility = () => {
    setIsAssignedAccessCodeModalOpen(!isAssignedAccessCodeModalOpen);
  };

  const [
    isAssignedUpdateAccessCodeModalOpen,
    setIsAssignedUpdateAccessCodeModalOpen,
  ] = useState(false);
  const toggleAssignedUpdateAccessCodeModalVisibility = () => {
    setIsAssignedUpdateAccessCodeModalOpen(
      !isAssignedUpdateAccessCodeModalOpen
    );
  };

  const [highSchools, setHighSchools] = useState([]);
  const [isFetchingHighSchools, setIsFetchingHighSchools] = useState(false);

  const [school, setSchool] = useState(null);
  const [isFetchingSchool, setIsFetchingSchool] = useState(false);
  const fetchSchool = async (school_id) => {
    try {
      setIsFetchingSchool(true);
      setSchool(await getSchoolById(school_id));
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      setIsFetchingSchool(false);
    }
  };

  const [provinces, setProvinces] = useState([]);
  const fetchProvinces = async () => {
    setProvinces(await getProvinces());
  };

  const [regions, setRegions] = useState([]);
  const [isFetchingRegions, setIsFetchingRegions] = useState(false);
  const fetchRegions = async (province_id = null) => {
    try {
      setIsFetchingRegions(true);
      const regions = await getRegions(province_id);
      setRegions(regions);
      return regions;
    } catch (error) {
      setRegions([]);
      return [];
    } finally {
      setIsFetchingRegions(false);
    }
  };

  const [schoolAdmins, setSchoolAdmins] = useState([]);
  const [isFetchingSchoolAdmins, setIsFetchingSchoolAdmins] = useState(false);
  const fetchSchoolAdmins = async (school_id) => {
    try {
      setIsFetchingSchoolAdmins(true);
      setSchoolAdmins(await getSchoolAdminBySchoolId(school_id));
    } catch (error) {
      setSchoolAdmins([]);
    } finally {
      setIsFetchingSchoolAdmins(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <InterestAndTalentSchoolContext.Provider
      value={{
        isSchoolModalOpen,
        toggleSchoolModalVisibility,

        isAddNewSchoolAdminModalOpen,
        toggleAddNewSchoolAdminModalVisibility,

        isAssignNewAccessCodeModalOpen,
        toggleAssignNewAccessCodeModalVisibility,

        isAssignedAccessCodeModalOpen,
        toggleAssignedAccessCodeModalVisibility,

        isAssignedUpdateAccessCodeModalOpen,
        toggleAssignedUpdateAccessCodeModalVisibility,

        highSchools,
        isFetchingHighSchools,
        setHighSchools,
        setIsFetchingHighSchools,

        school,
        isFetchingSchool,
        fetchSchool,

        provinces,
        fetchProvinces,

        regions,
        isFetchingRegions,
        fetchRegions,

        schoolAdmins,
        isFetchingSchoolAdmins,
        fetchSchoolAdmins,

        showPassword,
        togglePasswordVisibility,
      }}
    >
      {props.children}
    </InterestAndTalentSchoolContext.Provider>
  );
};

export default InterestAndTalentSchoolContextProvider;
