import {
  DialogContent,
  FormLabel,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
  Grid,
  Select,
  Option,
  Button,
} from "@mui/joy";
import React, { useState } from "react";
import AccessDenied from "./AccessDenied";
import { FormControl } from "@mui/material";

const courseOptionsByDepartment = {
  "College of Teacher Education": [
    "Bachelor of Elementary Education",
    "Bachelor of Secondary Education",
  ],
  "College of Business Education": [
    "Bachelor of Science in Business Administration",
    "Bachelor of Science in Entrepreneurship",
  ],
  "College of Computer Studies": [
    "Bachelor of Science in Information Technology",
    "Associate in Computer Technology",
  ],
};

const EditUser = ({
  user,
  open,
  onClose,
  setOpenSnackbar,
  setMessage,
  refreshData,
  checkPermission,
}) => {
  const [firstname, setFirstname] = useState(user.firstname);
  const [username, setUsername] = useState(user.username);
  const [lastname, setLastname] = useState(user.lastname);
  const [emailAddress, setEmailAddress] = useState(user.emailAddress);
  const [contactNumber, setContactNumber] = useState(user.contactNumber);
  const [category, setCategory] = useState(user.studentProfile?.category || "");
  const [gradeLevel, setGradeLevel] = useState(
    user.studentProfile?.gradeLevel || ""
  );
  const [strand, setStrand] = useState(user.studentProfile?.strand || "");
  const [yearLevel, setYearLevel] = useState(
    user.studentProfile?.yearLevel || ""
  );
  const [department, setDepartment] = useState(
    user.studentProfile?.department || ""
  );
  const [course, setCourse] = useState(user.studentProfile?.course || "");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updatedFormData = {
      username,
      firstname,
      lastname,
      emailAddress,
      contactNumber,
      studentProfile: {
        category,
        gradeLevel,
        strand,
        yearLevel,
        department,
        course,
      },
    };

    try {
      const response = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFormData),
      });

      if (response.ok) {
        onClose();
        await refreshData();
        setOpenSnackbar("success");
        setMessage("User updated successfully!");
      } else {
        const data = await response.json();
        setOpenSnackbar("danger");
        setMessage(`Failed to update user: ${data.error}`);
      }
    } catch (error) {
      setOpenSnackbar("danger");
      setMessage(`Error updating user: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal open={open === user._id} onClose={onClose}>
        <ModalDialog>
          <ModalClose />
          {checkPermission ? (
            <>
              <Typography level="h4">Edit Student Details</Typography>
              <form onSubmit={handleSubmit}>
                <DialogContent
                  sx={{
                    overflowX: "hidden",
                    overflowY: "auto", // Allows vertical scrolling
                    "&::-webkit-scrollbar": { display: "none" }, // Hides scrollbar in WebKit-based browsers (Chrome, Edge, Safari)
                    "-ms-overflow-style": "none", // Hides scrollbar in IE and Edge
                    "scrollbar-width": "none", // Hides scrollbar in Firefox
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth required>
                        <FormLabel>Username</FormLabel>
                        <Input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth required>
                        <FormLabel>First Name</FormLabel>
                        <Input
                          value={firstname}
                          onChange={(e) => setFirstname(e.target.value)}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth required>
                        <FormLabel>Last Name</FormLabel>
                        <Input
                          value={lastname}
                          onChange={(e) => setLastname(e.target.value)}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required>
                        <FormLabel>Email Address</FormLabel>
                        <Input
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth required>
                        <FormLabel>Contact Number</FormLabel>
                        <Input
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value)}
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                  {user?.role?.isStudentRole && (
                    <>
                      <Grid item xs={12}>
                        <FormControl fullWidth required>
                          <FormLabel>Student Category</FormLabel>
                          <Select
                            placeholder="Select Category"
                            value={category}
                            onChange={(e, val) => {
                              setCategory(val);
                              // Reset fields depending on the selected category
                              if (val === "BED") {
                                setGradeLevel("");
                                setStrand("");
                                setYearLevel("");
                                setDepartment("");
                                setCourse("");
                              } else if (val === "HED") {
                                setYearLevel("");
                                setDepartment("");
                                setCourse("");
                                setGradeLevel("");
                                setStrand("");
                              }
                            }}
                          >
                            <Option value="BED">BED</Option>
                            <Option value="HED">HED</Option>
                          </Select>
                        </FormControl>
                      </Grid>

                      {category === "BED" && (
                        <>
                          <Grid item xs={12}>
                            <FormControl fullWidth required>
                              <FormLabel>Grade Level</FormLabel>
                              <Select
                                placeholder="Select Grade Level"
                                value={gradeLevel}
                                onChange={(e, val) => setGradeLevel(val)}
                              >
                                {[
                                  "Grade 7",
                                  "Grade 8",
                                  "Grade 9",
                                  "Grade 10",
                                  "Grade 11",
                                  "Grade 12",
                                ].map((g) => (
                                  <Option key={g} value={g}>
                                    {g}
                                  </Option>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          {(gradeLevel === "Grade 11" ||
                            gradeLevel === "Grade 12") && (
                            <Grid item xs={12}>
                              <FormControl fullWidth required>
                                <FormLabel>Strand</FormLabel>
                                <Select
                                  placeholder="Select Strand"
                                  value={strand}
                                  onChange={(e, val) => setStrand(val)}
                                >
                                  {[
                                    "TVL-Programming",
                                    "STEM",
                                    "HUMSS",
                                    "TVL-Cookery",
                                    "ABM",
                                    "GAS",
                                  ].map((s) => (
                                    <Option key={s} value={s}>
                                      {s}
                                    </Option>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                          )}
                        </>
                      )}

                      {category === "HED" && (
                        <>
                          <Grid item xs={12}>
                            <FormControl fullWidth required>
                              <FormLabel>Year Level</FormLabel>
                              <Select
                                placeholder="Select Year Level"
                                value={yearLevel}
                                onChange={(e, val) => setYearLevel(val)}
                              >
                                {[
                                  "1st Year",
                                  "2nd Year",
                                  "3rd Year",
                                  "4th Year",
                                ].map((y) => (
                                  <Option key={y} value={y}>
                                    {y}
                                  </Option>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12}>
                            <FormControl fullWidth required>
                              <FormLabel>Department</FormLabel>
                              <Select
                                placeholder="Select Department"
                                value={department}
                                onChange={(e, val) => {
                                  setDepartment(val);
                                  setCourse(""); // Reset course when department changes
                                }}
                              >
                                {[
                                  "College of Teacher Education",
                                  "College of Business Education",
                                  "College of Computer Studies",
                                ].map((d) => (
                                  <Option key={d} value={d}>
                                    {d}
                                  </Option>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12}>
                            <FormControl fullWidth required>
                              <FormLabel>Course</FormLabel>
                              <Select
                                value={course}
                                onChange={(e, val) => setCourse(val)}
                                disabled={!department}
                                placeholder={
                                  !department
                                    ? "Select a department first"
                                    : "Select Course"
                                }
                              >
                                {(
                                  courseOptionsByDepartment[department] || []
                                ).map((c) => (
                                  <Option key={c} value={c}>
                                    {c}
                                  </Option>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        </>
                      )}
                    </>
                  )}
                </DialogContent>
                <Button
                  disabled={loading}
                  loading={loading}
                  type="submit"
                  sx={{ mt: 2 }}
                  fullWidth
                >
                  Update Student
                </Button>
              </form>
            </>
          ) : (
            <AccessDenied />
          )}
        </ModalDialog>
      </Modal>
    </>
  );
};

export default EditUser;
