import { useEffect, useRef, useState } from "react";
import Input from "../component/Input";
import { Link, useNavigate } from "react-router-dom";

const Formup = ({ isLoggedIn }) => {
  const submit = useRef();

  let [message, setmessage] = useState();
  let [form, setform] = useState({});
  let handlechange = (name, value) => {
    setform({ ...form, [name]: value });
  };

  const isdonesignup =
    form.firstName &&
    form.lastName &&
    form.age &&
    form.email &&
    form.password &&
    form.conformpassword &&
    form.password === form.conformpassword;
  const isdonesignin = form.email && form.password;

  const ischacked = form.password === form.conformpassword;

  const req = /\w{8,}\D+/g;

  const ischacked2 = req.test(form.password);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/${isLoggedIn ? "sign_in" : "sign_up"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const responseData = await res.json();
      setmessage(responseData.message);
      if (res.status === 400) {
      } else {
        if (responseData.token) {
          localStorage.setItem("user:token", responseData.token);
          localStorage.setItem(
            "user:detail",
            JSON.stringify(responseData.user)
          );
          if (isLoggedIn) {
            navigate("/", { state: { user: responseData.user } });
          } else {
            navigate("/users", { state: { user: responseData.user } });
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      console.log(
        "An error occurred while submitting the form. Please try again."
      );
    }
  };

  return (
    <>
      <div className={`form ${isLoggedIn ? "formlogedin" : ""}`}>
        <div className={`will ${isLoggedIn ? "willlogedin" : ""}`}>
          <h1 style={{ textTransform: "capitalize" }}>
            willcome to <span style={{ color: "red" }}>dardesh</span>
          </h1>
          <p style={{ margin: "10px" }}>
            {isLoggedIn ? "sign in to get exploer" : "sign up to get started"}
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isLoggedIn && isdonesignin) {
              handleSubmit();
            } else if (isdonesignup) {
              handleSubmit();
            }
          }}
          action=""
        >
          {isLoggedIn ? (
            ""
          ) : (
            <>
              <div className="fullname">
                <Input
                  label="first name"
                  name="firstName"
                  classname="user"
                  type="text"
                  placeholder="enter your first name"
                  change={handlechange}
                />
                <Input
                  label="last name"
                  name="lastName"
                  classname="user"
                  type="text"
                  placeholder="enter your last name"
                  change={handlechange}
                />
              </div>

              <div className="input" style={{ gap: "120px" }}>
                <label htmlFor="age">select your age</label>
                <select
                  className={form.age ? "chacked" : "unchacked"}
                  id="age"
                  onChange={(e) => {
                    handlechange("age", e.target.value);
                  }}
                >
                  <option>10</option>
                  <option>11</option>
                  <option>12</option>
                  <option>13</option>
                  <option>14</option>
                  <option>15</option>
                  <option>16</option>
                  <option>17</option>
                  <option>18</option>
                  <option>19</option>
                  <option>20</option>
                  <option>21</option>
                  <option>22</option>
                  <option>23</option>
                  <option>24</option>
                  <option>25</option>
                  <option>26</option>
                  <option>27</option>
                  <option>28</option>
                  <option>29</option>
                  <option>30</option>
                  <option>31</option>
                  <option>32</option>
                  <option>33</option>
                  <option>34</option>
                  <option>35</option>
                  <option>36</option>
                  <option>37</option>
                  <option>38</option>
                  <option>39</option>
                  <option>40</option>
                </select>
              </div>
            </>
          )}
          <Input
            label="your email"
            name="email"
            classname="email"
            type="email"
            placeholder="enter your email"
            change={handlechange}
          />

          <div className="input">
            <label htmlFor="password" className="password">
              conform password
            </label>
            <input
              type="password"
              id="password"
              className={`password ${
                isLoggedIn ? "" : ischacked2 ? "chacked" : "unchacked"
              }`}
              placeholder="enter your password"
              onChange={(e) => handlechange("password", e.target.value)}
            />
            {isLoggedIn ? (
              ""
            ) : (
              <span
                style={{
                  position: "absolute",
                  fontSize: "12px",
                  bottom: "-35px",
                  left: "10px",
                  color: "red",
                }}
              >
                {ischacked2
                  ? ""
                  : "password should contains at least 8 caracter (numbers & letters)"}
              </span>
            )}
          </div>
          {isLoggedIn ? (
            ""
          ) : (
            <div className="input">
              <label htmlFor="conformpassword" className="conformpassword">
                conform password
              </label>
              <input
                type="password"
                id="conformpassword"
                className={`conformpassword ${
                  ischacked ? "chacked" : "unchacked"
                }`}
                placeholder="conform your password"
                onChange={(e) =>
                  handlechange("conformpassword", e.target.value)
                }
              />
              <span
                style={{
                  position: "absolute",
                  fontSize: "14px",
                  bottom: "-25px",
                  left: "120px",
                  color: "red",
                }}
              >
                {ischacked ? "" : "not match"}
              </span>
            </div>
          )}
          <p style={{ color: "red", width: "fit-content", margin: "0 auto" }}>
            {message}
          </p>

          <input
            ref={submit}
            type="submit"
            value={isLoggedIn ? "sign in" : "sign up"}
            className={`submit ${
              isLoggedIn
                ? isdonesignin
                  ? ""
                  : "disabled"
                : isdonesignup
                ? ""
                : "disabled"
            }`}
          />
          <div style={{ margin: "0 auto", width: "fit-content" }}>
            <p style={{ display: "inline-block", marginRight: "5px" }}>
              if you {isLoggedIn && "don't"} have an acount you can
            </p>

            <Link
              to={isLoggedIn ? "/users/sign_up" : "/users/sign_in"}
              style={{
                color: "red",
                cursor: "pointer",
              }}
            >
              {isLoggedIn ? "sign up" : "sign in"}
            </Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default Formup;
