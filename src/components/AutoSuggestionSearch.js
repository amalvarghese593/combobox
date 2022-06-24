import { Fragment, useState, useRef } from "react";
import { Combobox } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

export const AutoSuggestionSearch = ({ apiCallOptions, inputPlaceholder }) => {
  const {
    url,
    queryParams,
    responsePattern,
    objectKey,
    idKey,
    dropdownItemsCount,
  } = apiCallOptions;
  const addListItemRef = useRef();
  const optionRef = useRef();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  Object.byString = function (o, s) {
    s = s.replace(/\[(\w+)\]/g, ".$1"); // convert indexes to properties
    s = s.replace(/^\./, ""); // strip a leading dot
    var a = s.split(".");
    for (var i = 0, n = a.length; i < n; ++i) {
      var k = a[i];
      if (k in o) {
        o = o[k];
      } else {
        return;
      }
    }
    return o;
  };
  const timeout = useRef();
  const valueHandler = (e) => {
    clearTimeout(timeout.current);

    const typedValue = e.target.value;
    setQuery(typedValue);

    const fetch = async () => {
      try {
        const response = await axios.get(
          `${url}?${queryParams}=${typedValue}`
          //   `https://firstleap-api.firstconnectsolutions.com/api/v1/users/getLocations?search=${typedValue}`
        );
        setIsLoading(false);
        const dataObj = Object.byString(response, responsePattern);
        // const locationObj = response.data.data;
        setData(dataObj.slice(0, dropdownItemsCount));
      } catch (error) {
        setIsLoading(false);
        console.log({ error });
      }
    };
    if (typedValue.length >= 2) {
      setIsLoading(true);
      timeout.current = setTimeout(() => {
        fetch();
      }, 3000);
    }
  };

  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState("");

  const filteredData =
    query === ""
      ? data
      : data.filter((el) =>
          el[objectKey]
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  return (
    <div className="combo-wrapper p-2">
      <div className="w-full">
        <Combobox value={selected} onChange={setSelected} multiple>
          <div className="relative mt-1 pb-2">
            <div className="relative w-80 sm:w-96 mx-auto cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
              <Combobox.Input
                className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                onChange={valueHandler}
                onKeyDown={(e) => {
                  if (
                    filteredData.length === 0 &&
                    query.length >= 2 &&
                    e.key === "Enter"
                  ) {
                    addListItemRef.current?.click();
                    setQuery("");
                  }
                }}
                placeholder={inputPlaceholder}
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                {!isLoading &&
                filteredData.length === 0 &&
                query.length >= 2 ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    onClick={() => {
                      addListItemRef.current.click();
                      setQuery("");
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                ) : (
                  <SelectorIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                )}
              </Combobox.Button>
            </div>
            <Combobox.Options className="absolute mt-1 max-h-60 w-80 sm:w-96 left-1/2 -translate-x-1/2 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {isLoading && (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  <span>Loading...</span>
                </div>
              )}
              {!isLoading && filteredData.length === 0 && query.length >= 2 && (
                <div
                  className="relative cursor-default select-none py-2 px-4 text-gray-700"
                  ref={addListItemRef}
                  onClick={() => {
                    setQuery("");
                    setSelected((prev) => {
                      let arr = [...prev];
                      if (query.includes(",")) {
                        const multipleValues = query.split(",");
                        multipleValues.forEach((value) => {
                          if (value.trim() !== "") {
                            arr.push({ _id: uuidv4(), [objectKey]: value });
                          }
                        });
                      } else {
                        arr.push({ _id: uuidv4(), [objectKey]: query });
                      }
                      return arr;
                    });
                  }}
                >
                  Add {query}
                </div>
              )}
              {!isLoading &&
                filteredData.map((el) => (
                  <Combobox.Option
                    ref={optionRef}
                    key={el[idKey]}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? "bg-teal-600 text-white" : "text-gray-900"
                      }`
                    }
                    value={el}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {el[objectKey]}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "text-white" : "text-teal-600"
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))}
            </Combobox.Options>
          </div>
          {!!selected.length && (
            <ul className="list-group combo-list-group">
              {selected.map((el) => (
                <Fragment key={el[idKey]}>
                  <li>
                    {el[objectKey]}
                    <span
                      onClick={() => {
                        setSelected((prev) => {
                          const index = prev.indexOf(el);
                          const arr = [...prev];
                          arr.splice(index, 1);
                          return arr;
                        });
                      }}
                    >
                      x
                    </span>
                  </li>
                </Fragment>
              ))}
            </ul>
          )}
        </Combobox>
      </div>
    </div>
  );
};
