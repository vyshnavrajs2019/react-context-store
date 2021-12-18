import React from "react";

export const createModelDB = (pk = "id") => {
  const ModelDBContext = React.createContext();

  const ModelDBListProvider = ({ children }) => {
    const [modelDB, setModelDB] = React.useState({});

    function toArray() {
      return Object.values(modelDB);
    }

    function upsert(data) {
      let transformedData = data;
      if (!(data instanceof Array)) transformedData = [data];

      const updates = {};
      transformedData.forEach((data) => {
        const { [pk]: pkKey } = data;
        updates[pkKey] = data;
      });

      setModelDB((db) => ({ ...db, ...updates }));
    }

    function destroy(pk) {
      setModelDB((db) => {
        const updates = { ...db };
        delete updates[pk];
        return updates;
      });
    }

    return (
      <ModelDBContext.Provider
        value={{ modelDB, setModelDB, toArray, upsert, destroy }}
      >
        {children}
      </ModelDBContext.Provider>
    );
  };

  const useModel = () => {
    const context = React.useContext(ModelDBContext);
    if (context === undefined)
      throw new Error(
        "withPK can only be called inside its ModelDBListProvider"
      );

    return context;
  };

  const withPK = (Component) => {
    return ({ pk, ...other }) => {
      const context = useModel();

      const {
        modelDB: { [pk]: pkData },
        setModelDB
      } = context;

      return (
        <MemoizedComponent
          pk={pk}
          pkData={pkData}
          Component={Component}
          setModelDB={setModelDB}
          {...other}
        />
      );
    };
  };

  const MemoizedComponent = React.memo(({ Component, ...other }) => (
    <Component {...other} />
  ));

  return { ModelDBContext, ModelDBListProvider, withPK, useModel };
};
