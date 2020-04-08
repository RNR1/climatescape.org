import React, { useState } from "react"
import _ from "lodash"

import Select from "react-select"

// We prefer to use Tailwind when possible, but this is the preferred way to
// achieve custom styles with react-select. See https://react-select.com/styles
const STYLES = {
  container: styles => ({
    ...styles,
    display: "block",
    marginRight: "4px",
    maxWidth: "25%",
    height: "28px",
    verticalAlign: "middle",
    flexGrow: 1,
  }),
  control: provided => ({
    ...provided,
    minHeight: "28px",
    maxHeight: "28px",
    borderRadius: "9999px",
    maxWidth: "100%",
    backgroundColor: "#f7fafc",
  }),
  indicatorsContainer: provided => ({
    ...provided,
    height: "24px",
  }),
  indicatorSeparator: provided => ({
    ...provided,
    display: "none",
  }),
  dropdownIndicator: provided => ({
    ...provided,
    padding: "0px",
    paddingRight: "5px",
  }),
  placeholder: provided => ({
    ...provided,
    position: "static",
    top: "auto",
    transform: "none",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
  menu: provided => ({
    ...provided,
    width: "max-content",
    minWidth: "100%",
  }),

  option: (provided, { isFocused, isSelected }) => {
    return {
      ...provided,
      backgroundColor: isFocused ? "#e2e8f0" : null,
      fontWeight: isSelected ? "bold" : "normal",
      color: "#111",
    }
  },
  singleValue: provided => ({
    ...provided,
    maxWidth: "none",
    position: "static",
    top: "auto",
    transform: "none",
  }),
  valueContainer: provided => ({
    ...provided,
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  }),
}

export const useOrganizationFilterState = () => {
  const [byCategory, setCategoryFilter] = useState(null)
  const [byRole, setRoleFilter] = useState(null)
  const [byLocation, setLocationFilter] = useState(null)
  const [byHeadcount, setHeadcountFilter] = useState(null)
  const [byOrgType, setOrgTypeFilter] = useState(null)
  const [byCapitalType, setCapitalTypeFilter] = useState(null)
  const [byCapitalStrategic, setCapitalStrategicFilter] = useState(null)
  const [byCapitalStage, setCapitalStageFilter] = useState(null)
  const [byCapitalCheckSize, setCapitalCheckSizeFilter] = useState(null)
  const [byCapitalImpactSpecific, setCapitalImpactSpecificFilter] = useState(
    null
  )

  const setFilter = {
    byCategory: setCategoryFilter,
    byRole: setRoleFilter,
    byLocation: setLocationFilter,
    byHeadcount: setHeadcountFilter,
    byOrgType: setOrgTypeFilter,
    byCapitalType: setCapitalTypeFilter,
    byCapitalStrategic: setCapitalStrategicFilter,
    byCapitalStage: setCapitalStageFilter,
    byCapitalCheckSize: setCapitalCheckSizeFilter,
    byCapitalImpactSpecific: setCapitalImpactSpecificFilter,
    none: () => {
      setCategoryFilter(null)
      setRoleFilter(null)
      setLocationFilter(null)
      setHeadcountFilter(null)
      setOrgTypeFilter(null)
      setCapitalTypeFilter(null)
      setCapitalStrategicFilter(null)
      setCapitalStageFilter(null)
      setCapitalCheckSizeFilter(null)
      setCapitalImpactSpecificFilter(null)
    },
  }

  const applyFilter = organizations => {
    if (byCategory)
      organizations = organizations.filter(org =>
        org.categories.find(cat => cat.id === byCategory?.id)
      )

    if (byRole)
      organizations = organizations.filter(
        org => org.role?.find(role => role === byRole)
      )

    if (byLocation)
      organizations = organizations.filter(org => org.location === byLocation)

    if (byHeadcount)
      organizations = organizations.filter(org => org.headcount === byHeadcount)

    if (byOrgType)
      organizations = organizations.filter(org => org.orgType === byOrgType)

    if (byCapitalType)
      organizations = organizations.filter(
        org => org.capitalProfile?.type?.indexOf(byCapitalType) >= 0
      )

    if (byCapitalStrategic !== null)
      organizations = organizations.filter(
        org => org.capitalProfile?.strategic === byCapitalStrategic
      )

    if (byCapitalStage)
      organizations = organizations.filter(
        org => org.capitalProfile?.stage?.indexOf(byCapitalStage) >= 0
      )

    if (byCapitalCheckSize)
      organizations = organizations.filter(
        org => org.capitalProfile?.checkSize?.indexOf(byCapitalCheckSize) >= 0
      )

    if (byCapitalImpactSpecific !== null)
      organizations = organizations.filter(
        org => org.capitalProfile?.impactSpecific === byCapitalImpactSpecific
      )

    return organizations
  }

  return [
    {
      byCategory,
      byRole,
      byLocation,
      byHeadcount,
      byOrgType,
      byCapitalType,
      byCapitalStrategic,
      byCapitalStage,
      byCapitalCheckSize,
      byCapitalImpactSpecific,
    },
    setFilter,
    applyFilter,
  ]
}

const AnyOption = { value: null, label: "Any" }
const CapitalImpactSpecificOptions = [
  AnyOption,
  { value: true, label: "Only impact-specific" },
  { value: false, label: "Not impact-specific" },
]
const CapitalStrategicOptions = [
  AnyOption,
  { value: true, label: "Only strategic" },
  { value: false, label: "Not strategic" },
]
const makeOption = value => ({ value, label: value })
const extractNumeric = str =>
  parseInt(
    str
      .replace("k", "000")
      .replace("M", "000000")
      .match(/\d+,?/gi)
      .pop(),
    10
  )

const formatRoles = organizations => {
  const formatted = _.chain(organizations)
    .flatMap("role")
    .compact()
    .uniq()
    .filter(role => role !== "Capital") // Capital orgs have their own page
    .sort()
    .map(makeOption)
    .value()

  return [ AnyOption, ...formatted ]
}

const formatCategories = organizations => {
  const formatted = _.chain(organizations)
    .flatMap("categories")
    .compact()
    .uniqBy(category => category.id)
    .sortBy(category => category.name)
    .map(category => ({
      value: category,
      label: category.name,
    }))
    .value()

  return [AnyOption, ...formatted]
}

const formatHeadcounts = organizations => {
  const formatted = _.chain(organizations)
    .map("headcount")
    .uniq()
    .compact()
    .sortBy(extractNumeric)
    .map(makeOption)
    .value()

  return [AnyOption, ...formatted]
}

const formatCapitalCheckSizes = organizations => {
  const formatted = _.chain(organizations)
    .map("capitalProfile")
    .compact()
    .flatMap("checkSize")
    .compact()
    .uniq()
    .sortBy(extractNumeric)
    .map(makeOption)
    .value()

  return [AnyOption, ...formatted]
}

const formatOrgTypes = organizations => {
  const formatted = _.chain(organizations)
    .map("orgType")
    .uniq()
    .compact()
    .sort()
    .map(makeOption)
    .value()

  return [AnyOption, ...formatted]
}

const FilterSelect = ({ value, onChangeFilter, options, ...props }) => {
  const selectValue =
    value !== null
      ? options.find(({ value: optionValue }) => optionValue === value)
      : null

  const onChange = o => onChangeFilter(o ? o.value : null)

  return (
    <Select
      {...props}
      options={options}
      onChange={onChange}
      styles={STYLES}
      isSearchable={false}
      value={selectValue}
    />
  )
}

const OrganizationFilter = ({
  currentFilter,
  onApplyFilter,
  organizations,
  showFilters,
}) => {
  const {
    byCategory,
    byRole,
    byHeadcount,
    byOrgType,
    byCapitalCheckSize,
    byCapitalStrategic,
    byCapitalImpactSpecific,
  } = currentFilter

  const filters = {
    category: () => (
      <FilterSelect
        key="category"
        options={formatCategories(organizations)}
        onChangeFilter={onApplyFilter.byCategory}
        placeholder="Category"
        value={byCategory}
      />
    ),
    role: () => (
      <FilterSelect
        key="role"
        options={formatRoles(organizations)}
        onChangeFilter={onApplyFilter.byRole}
        placeholder="Role"
        value={byRole}
      />
    ),
    headcount: () => (
      <FilterSelect
        key="headcount"
        options={formatHeadcounts(organizations)}
        onChangeFilter={onApplyFilter.byHeadcount}
        placeholder="Headcount"
        value={byHeadcount}
      />
    ),
    orgType: () => (
      <FilterSelect
        key="orgType"
        options={formatOrgTypes(organizations)}
        onChangeFilter={onApplyFilter.byOrgType}
        placeholder="Org Type"
        value={byOrgType}
      />
    ),
    capitalCheckSize: () => (
      <FilterSelect
        key="capitalCheckSize"
        options={formatCapitalCheckSizes(organizations)}
        onChangeFilter={onApplyFilter.byCapitalCheckSize}
        placeholder="Check Size"
        value={byCapitalCheckSize}
      />
    ),
    capitalImpactSpecific: () => (
      <FilterSelect
        key="capitalImpactSpecific"
        options={CapitalImpactSpecificOptions}
        onChangeFilter={onApplyFilter.byCapitalImpactSpecific}
        placeholder="Impact-specific?"
        value={byCapitalImpactSpecific}
      />
    ),
    capitalStrategic: () => (
      <FilterSelect
        key="capitalStrategic"
        options={CapitalStrategicOptions}
        onChangeFilter={onApplyFilter.byCapitalStrategic}
        placeholder="Strategic"
        value={byCapitalStrategic}
      />
    ),
  }

  return (
    <>
      <div className="hidden sm:flex items-center text-gray-700 text-sm max-w-6xl mt-3">
        <span className="mr-2 inline-block h-6 min-h-full">Filter:</span>

        {showFilters.map(f => filters[f]())}
      </div>
    </>
  )
}

export default OrganizationFilter
