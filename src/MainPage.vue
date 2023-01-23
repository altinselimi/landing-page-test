<script setup>
import { useStore } from "vuex";
import { computed, ref } from "vue";
import { Float } from "@headlessui-float/vue";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/vue";
import { ChevronDown, Check, X, Loader } from "lucide-vue-next";

const store = useStore();
const hasFetchedPhones = ref(false);
store.dispatch("fetchPhones").then(() => (hasFetchedPhones.value = true));
const phones = computed(() => store.state.phones);

const filters = computed(() => ({
  brand: {
    label: "Brand",
    hasPrependOnSelection: false,
    id: "brand",
    options: [...new Set(phones.value.map((phone) => phone.manufacturer))].map(
      (brand) => ({ label: brand, value: brand })
    ),
    checkValidity: (phone, input) => phone.manufacturer === input,
  },
  color: {
    label: "Color",
    hasPrependOnSelection: false,
    id: "color",
    options: [...new Set(phones.value.map((phone) => phone.colors).flat())].map(
      (color) => ({ label: color.toLowerCase(), value: color })
    ),
    checkValidity: (phone, input) => phone.colors.includes(input),
  },
  has5g: {
    label: "5G",
    hasPrependOnSelection: true,
    id: "has5g",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
    checkValidity: (phone, input) => phone.has_5g === input,
  },
  operatingSystem: {
    label: "Operating system",
    hasPrependOnSelection: false,
    id: "operatingSystem",
    options: [
      ...new Set(phones.value.map((phone) => phone.operating_system)),
    ].map((os) => ({ label: os, value: os })),
    checkValidity: (phone, input) => phone.operating_system === input,
  },
  hasEsim: {
    label: "E-sim",
    hasPrependOnSelection: true,
    id: "hasEsim",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
    checkValidity: (phone, input) => phone.has_esim === input,
  },
  refurbished: {
    label: "Refurbished",
    hasPrependOnSelection: true,
    id: "refurbished",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
    checkValidity: (phone, input) => phone.refurbished === input,
  },
}));

const filterModelValues = ref(
  Object.keys(filters.value).reduce((acc, curr) => {
    acc[curr] = [];
    return acc;
  }, {})
);

const sortByOptions = [
  { label: "Most popular", value: "most_popular" },
  { label: "Most recent", value: "most_recent" },
  { label: "On sale", value: "on_sale" },
];

const activeFilters = computed(() => {
  return Object.keys(filterModelValues.value).filter(
    (filterId) => filterModelValues.value[filterId].length
  );
});
const activeFilterWithLabels = computed(() =>
  activeFilters.value
    .reduce((acc, curr) => {
      const values = filterModelValues.value[curr].map((value) =>
        filters.value[curr].options.find((option) => option.value === value)
      );
      const { hasPrependOnSelection, label, id } = filters.value[curr];

      acc.push(
        hasPrependOnSelection
          ? values.map((value) => ({
              label: `${label}: ${value.label}`,
              value: value,
              id,
            }))
          : values.map((value) => ({ ...value, id }))
      );
      return acc;
    }, [])
    .flat()
);

const filteredPhones = computed(() => {
  if (!activeFilters.value.length) return phones.value;
  return phones.value.filter((phone) => {
    return activeFilters.value.every((filterId) => {
      const filter = filters.value[filterId];
      const modelValues = filterModelValues.value[filterId];
      return modelValues.some((value) => filter.checkValidity(phone, value));
    });
  });
});

const removeFilter = (filterId, value) => {
  const currentIdx = filterModelValues.value[filterId].findIndex(
    (filterValue) => filterValue === value
  );
  filterModelValues.value[filterId].splice(currentIdx, 1);
};
</script>
<template>
  <template v-if="!hasFetchedPhones">
    <div
      style="
        display: flex;
        align-items: center;
        flex-direction: column;
        margin: auto;
      "
    >
      <Loader class="is-spinning" />
      <span>Loading...</span>
    </div>
  </template>
  <template v-else>
    <h1 v-if="filteredPhones.length">
      Choose from
      <span style="font-weight: 900">{{ filteredPhones.length }} phones</span>
    </h1>
    <h1 v-else>No match could be made. Please try some different filters.</h1>
    <ul class="filters__wrapper">
      <li v-for="filter in filters">
        <Listbox v-model="filterModelValues[filter.id]" multiple>
          <Float :offset="10">
            <ListboxButton class="filter__button">
              {{ filter.label }} <ChevronDown />
            </ListboxButton>
            <ListboxOptions as="ul" class="filter__dropdown-content">
              <ListboxOption
                v-for="option in filter.options"
                :key="option.value"
                as="li"
                :value="option.value"
                v-slot="{ selected }"
              >
                {{ option.label }}
                <Check :class="{ 'is-invisible': !selected }" />
              </ListboxOption>
            </ListboxOptions>
          </Float>
        </Listbox>
      </li>
    </ul>
    <ul class="filters__active-filters">
      <li
        v-for="activeFilter in activeFilterWithLabels"
        class="active-filter__label"
      >
        <span>
          {{ activeFilter.label }}
        </span>
        <button @click="removeFilter(activeFilter.id, activeFilter.value)">
          <X />
        </button>
      </li>
    </ul>
    <ul class="phones__wrapper">
      <li class="phone__wrapper" v-for="phone in filteredPhones">
        <img
          src="/product_image.webp"
          loading="lazy"
          :alt="`Phone: ${phone.name} by ${phone.manufacturer}`"
        />
        <div class="phone__action-buttons">
          <div class="phone__info">
            <div class="phone__brand text-truncate">
              {{ phone.manufacturer }}
            </div>
            <div class="phone__name text-truncate">
              {{ phone.name }}
            </div>
          </div>
          <button>
            Bekijk
            <ChevronDown style="transform: rotate(-90deg)" />
          </button>
        </div>
      </li>
    </ul>
  </template>
</template>

<style lang="scss" scoped>
.filters {
  &__wrapper {
    display: flex;
    flex-wrap: wrap;
    padding: 20px 20px;
    background-color: white;
    border-radius: 14px;
    margin: 10px 0px;
  }
  &__active-filters {
    display: flex;
    padding: 0px 6px;
    li {
      margin: 10px;
      border: solid 1px var(--grey-dark);
      border-radius: 8px;
      padding: 10px 14px;
    }
  }
}
.filter {
  &__button {
    background-color: white;
    padding: 0px;
    display: flex;
    align-items: center;
    cursor: pointer;
    margin: 10px;
    svg {
      margin-left: 8px;
      stroke: #333;
      width: 18px;
      height: 18px;
    }
    &[data-headlessui-state="open"] svg {
      transform: scale(1, -1);
    }
  }
  &__dropdown-content {
    min-width: 100%;
    background-color: rgba(white, 0.7);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: rgb(0 0 0 / 9%) 0px 3px 12px;
    padding: 8px;
    li {
      padding: 10px 14px;
      cursor: pointer;
      border-radius: 8px;
      line-height: 1;
      display: flex;
      align-items: center;
      svg {
        width: 14px;
        height: 14px;
        stroke: #333;
        margin-left: 8px;
        margin-left: auto;
      }
      &:hover {
        background-color: var(--grey);
      }
    }
  }
}

.phones__wrapper {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-column-gap: 20px;
  grid-row-gap: 20px;
  margin: 20px 0px;
  padding: 0px;
  @media only screen and (max-width: 820px) {
    grid-template-columns: 1fr;
  }
}
.phone {
  &__wrapper {
    display: flex;
    flex-direction: column;
    border-radius: 14px;
    background-color: white;
    padding: 10px 10px;
    img {
      max-width: 100%;
      max-height: 270px;
      margin: 0 auto;
      padding: 20px;
      align-self: center;
    }
  }
  &__action-buttons {
    padding: 20px 20px;
    display: flex;
    button {
      padding: 0px;
      background: transparent;
      display: flex;
      align-items: center;
      margin-left: auto;
      align-self: flex-end;
      font-size: 1rem;
      margin-bottom: 3px;
    }
    button svg {
      background-color: var(--blue);
      border-radius: 100px;
      stroke: white;
      margin-left: 6px;
      width: 16px;
      height: 16px;
    }
  }
  &__name {
    font-weight: 800;
    font-size: 1.1rem;
  }
}

.active-filter__label {
  display: flex;
  align-items: center;
  button {
    display: flex;
    align-items: center;
    border-radius: 100%;
    padding: 2px;
    cursor: pointer;
    margin-left: 4px;
    &:hover {
      background-color: white;
    }
  }
  svg {
    width: 16px;
    height: 16px;
  }
}
</style>
