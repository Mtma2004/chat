import React, { useState } from "react";

const Input = ({
  label = "",
  name = "",
  classname = "",
  type = "",
  placeholder = "",
  change,
}) => {
  return (
    <>
      <div className="input">
        <label htmlFor={name} className={classname}>
          {label}
        </label>
        <input
          type={type}
          id={name}
          className={classname}
          placeholder={placeholder}
          onChange={(e) => {
            change(name, e.target.value);
          }}
        />
      </div>
    </>
  );
};

export default Input;
