const objToString = (E) => {
    return E
        ? Object.keys(E)
              .map((key) => {
                  return key + ": " + E[key];
              })
              .join(", ")
        : "--";
};


export { objToString }