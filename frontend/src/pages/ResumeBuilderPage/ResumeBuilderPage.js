import React, { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";
import "./ResumeBuilderStyle.css";
import axios from "axios";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Function to get user ID from token
const getUserIdFromToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded?.user?.id;
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};

const ResumeBuilderPage = () => {
  const [resumeExists, setResumeExists] = useState(false);
  useEffect(() => {
    const fetchResumeData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const userId = getUserIdFromToken(token);
      if (!token || !userId) {
        console.error("No token found, cannot fetch resume data");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/resumes/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.data && response.data.data.length > 0) {
          setResumeData(response.data.data[0]);
          setResumeExists(true);
        } else {
          setResumeExists(false);
        }
      } catch (error) {
        console.error("Error fetching resume data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumeData();
  }, []);
  const [resumeData, setResumeData] = useState({
    basicInfo: {
      firstName: "",
      lastName: "",
      contact: "",
      address: "",
      email: "",
      linkedin: "",
      github: "",
      objective: "",
    },
    education: [
      {
        degree: "",
        institute: "",
        fieldOfStudy: "",
        location: "",
        startDate: "",
        endDate: "",
        cgpa: "",
      },
    ],
    workExperience: [
      {
        company: "",
        designation: "",
        startDate: "",
        endDate: "",
      },
    ],
    skills: {
      technical: [],
      soft: [],
      additional: [],
    },
    achievements: [],
    projects: [],
    extracurricular: [],
    leadership: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  const [activeSection, setActiveSection] = useState("basicInfo");
  const [newSkill, setNewSkill] = useState("");
  const [newAchievement, setNewAchievement] = useState("");
  const [newProject, setNewProject] = useState("");
  const [newExtracurricular, setNewExtracurricular] = useState("");
  const [newLeadership, setNewLeadership] = useState("");

  const handleInputChange = (section, index, field, value) => {
    setResumeData((prevData) => {
      if (Array.isArray(prevData[section])) {
        const newArray = [...prevData[section]];
        newArray[index] = { ...newArray[index], [field]: value };
        return { ...prevData, [section]: newArray };
      } else if (typeof prevData[section] === "object") {
        return {
          ...prevData,
          [section]: { ...prevData[section], [field]: value },
        };
      } else {
        return {
          ...prevData,
          [section]: value,
        };
      }
    });
  };

  const addItem = (section) => {
    const newItem =
      section === "education"
        ? {
            degree: "",
            institute: "",
            fieldOfStudy: "",
            location: "",
            startDate: "",
            endDate: "",
            cgpa: "",
          }
        : section === "workExperience"
        ? {
            company: "",
            designation: "",
            startDate: "",
            endDate: "",
          }
        : "";
    setResumeData((prevData) => ({
      ...prevData,
      [section]: [...prevData[section], newItem],
    }));
  };
  // console.log(resumeData);

  const removeItem = (section, index) => {
    setResumeData((prevData) => ({
      ...prevData,
      [section]: prevData[section].filter((_, i) => i !== index),
    }));
  };

  const addSkill = (type, skill) => {
    setResumeData((prevData) => ({
      ...prevData,
      skills: {
        ...prevData.skills,
        [type]: [...prevData.skills[type], skill],
      },
    }));
    setNewSkill("");
  };

  const addAchievement = (achievement) => {
    setResumeData((prevData) => ({
      ...prevData,
      achievements: [...prevData.achievements, achievement],
    }));
    setNewAchievement("");
  };

  const addProject = (project) => {
    setResumeData((prevData) => ({
      ...prevData,
      projects: [...prevData.projects, project],
    }));
    setNewProject("");
  };

  const addExtracurricular = (extracurricular) => {
    setResumeData((prevData) => ({
      ...prevData,
      extracurricular: [...prevData.extracurricular, extracurricular],
    }));
    setNewExtracurricular("");
  };

  const addLeadership = (leadership) => {
    setResumeData((prevData) => ({
      ...prevData,
      leadership: [...prevData.leadership, leadership],
    }));
    setNewLeadership("");
  };

  // Save resume data
  const saveAndContinue = async (nextSection) => {
    await saveResumeData(activeSection);
    setActiveSection(nextSection);
  };
  const saveResumeData = async (section) => {
    const token = localStorage.getItem("token");
    const userId = getUserIdFromToken(token);
    //if else sstatement if data was fetched or not
    try {
      let response;
      if (resumeExists) {
        // If resume data was fetched, perform PUT operation
        await axios.put(
          `http://localhost:5000/api/resumes/${userId}`,
          { userId, [section]: resumeData[section] },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Resume data saved:", response.data.data);
      } else {
        // If no resume data was fetched, perform POST operation
        console.log("No resume data found, initializing empty resume.");
        const newResume = await axios.post(
          `http://localhost:5000/api/resumes`,
          { userId, [section]: resumeData[section] },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setResumeExists(true); // Set to true after successful POST
      }
    } catch (error) {
      console.error("Error saving resume data:", error);
    }
  };
  const deleteResume = async () => {
    const token = localStorage.getItem("token");
    const userId = getUserIdFromToken(token);

    try {
      await axios.delete(`http://localhost:5000/api/resumes/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setResumeData({
        basicInfo: {
          firstName: "",
          lastName: "",
          contact: "",
          address: "",
          email: "",
          linkedin: "",
          github: "",
          objective: "",
        },
        education: [],
        workExperience: [],
        skills: {
          technical: [],
          soft: [],
          additional: [],
        },
        achievements: [],
        projects: [],
        extracurricular: [],
        leadership: [],
      });
      setResumeExists(false);
      console.log("Resume deleted successfully.");
    } catch (error) {
      console.error("Error deleting resume:", error);
    }
  };

  const downloadPdf = () => {
    const element = document.getElementById("resume-preview"); // Assuming 'resume-preview' is the id of your resume preview container
    const opt = {
      margin: 0,
      filename: "my_resume.pdf",
      image: { type: "jpeg", quality: 0.99 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait",
      },
    };

    // New Promise-based usage:
    html2pdf().set(opt).from(element).save();
  };

  const renderForm = () => {
    switch (activeSection) {
      case "basicInfo":
        return (
          <div className="form-section">
            <h2>Basic Information</h2>
            <input
              type="text"
              placeholder="First Name"
              value={resumeData.basicInfo.firstName || ""}
              onChange={(e) =>
                handleInputChange("basicInfo", 0, "firstName", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Last Name"
              value={resumeData.basicInfo.lastName || ""}
              onChange={(e) =>
                handleInputChange("basicInfo", 0, "lastName", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Contact"
              value={resumeData.basicInfo.contact || ""}
              onChange={(e) =>
                handleInputChange("basicInfo", 0, "contact", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Address"
              value={resumeData.basicInfo.address || ""}
              onChange={(e) =>
                handleInputChange("basicInfo", 0, "address", e.target.value)
              }
            />
            <input
              type="email"
              placeholder="Email"
              value={resumeData.basicInfo.email || ""}
              onChange={(e) =>
                handleInputChange("basicInfo", 0, "email", e.target.value)
              }
            />
            <input
              type="url"
              placeholder="LinkedIn"
              value={resumeData.basicInfo.linkedin || ""}
              onChange={(e) =>
                handleInputChange("basicInfo", 0, "linkedin", e.target.value)
              }
            />
            <input
              type="url"
              placeholder="GitHub"
              value={resumeData.basicInfo.github || ""}
              onChange={(e) =>
                handleInputChange("basicInfo", 0, "github", e.target.value)
              }
            />
            <textarea
              placeholder="Objective"
              value={resumeData.basicInfo.objective || ""}
              onChange={(e) =>
                handleInputChange("basicInfo", 0, "objective", e.target.value)
              }
            />
            <button onClick={() => saveAndContinue("education")}>
              Save and Continue
            </button>
          </div>
        );
      case "education":
        return (
          <div className="form-section">
            <h2>Education</h2>
            {resumeData.education.map((edu, index) => (
              <div key={index} className="education-item">
                <input
                  type="text"
                  placeholder="Degree"
                  value={edu.degree || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "education",
                      index,
                      "degree",
                      e.target.value
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="Institute"
                  value={edu.institute || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "education",
                      index,
                      "institute",
                      e.target.value
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="Field of Study"
                  value={edu.fieldOfStudy || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "education",
                      index,
                      "fieldOfStudy",
                      e.target.value
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={edu.location || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "education",
                      index,
                      "location",
                      e.target.value
                    )
                  }
                />
                <input
                  type="date"
                  placeholder="Start Date"
                  value={edu.startDate || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "education",
                      index,
                      "startDate",
                      e.target.value
                    )
                  }
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={edu.endDate || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "education",
                      index,
                      "endDate",
                      e.target.value
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="CGPA (optional)"
                  value={edu.cgpa || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "education",
                      index,
                      "cgpa",
                      e.target.value
                    )
                  }
                />
                <button onClick={() => removeItem("education", index)}>
                  Remove
                </button>
              </div>
            ))}
            <button onClick={() => addItem("education")}>Add Education</button>
            <button onClick={() => saveAndContinue("workExperience")}>
              Save and Continue
            </button>
          </div>
        );
      case "workExperience":
        return (
          <div className="form-section">
            <h2>Work Experience</h2>
            {resumeData.workExperience.map((exp, index) => (
              <div key={index} className="work-experience-item">
                <input
                  type="text"
                  placeholder="Company"
                  value={exp.company || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "workExperience",
                      index,
                      "company",
                      e.target.value
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="Designation"
                  value={exp.designation || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "workExperience",
                      index,
                      "designation",
                      e.target.value
                    )
                  }
                />
                <input
                  type="date"
                  placeholder="Start Date"
                  value={exp.startDate || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "workExperience",
                      index,
                      "startDate",
                      e.target.value
                    )
                  }
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={exp.endDate || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "workExperience",
                      index,
                      "endDate",
                      e.target.value
                    )
                  }
                />
                <button onClick={() => removeItem("workExperience", index)}>
                  Remove
                </button>
              </div>
            ))}
            <button onClick={() => addItem("workExperience")}>
              Add Work Experience
            </button>
            <button onClick={() => saveAndContinue("skills")}>
              Save and Continue
            </button>
          </div>
        );
      case "skills":
        return (
          <div className="form-section">
            <h2>Skills</h2>
            <h3>Technical Skills</h3>
            <input
              type="text"
              placeholder="Add a technical skill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  addSkill("technical", newSkill);
                }
              }}
            />
            <div className="skills-list">
              {resumeData.skills.technical.map((skill, index) => (
                <span key={index} className="skill-item">
                  {skill}
                  <button onClick={() => removeItem("technical", index)}>
                    x
                  </button>
                </span>
              ))}
            </div>

            <h3>Soft Skills</h3>
            <input
              type="text"
              placeholder="Add a soft skill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  addSkill("soft", newSkill);
                }
              }}
            />
            <div className="skills-list">
              {resumeData.skills.soft.map((skill, index) => (
                <span key={index} className="skill-item">
                  {skill}
                  <button onClick={() => removeItem("soft", index)}>x</button>
                </span>
              ))}
            </div>

            <h3>Additional Skills</h3>
            <input
              type="text"
              placeholder="Add an additional skill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  addSkill("additional", newSkill);
                }
              }}
            />
            <div className="skills-list">
              {resumeData.skills.additional.map((skill, index) => (
                <span key={index} className="skill-item">
                  {skill}
                  <button onClick={() => removeItem("additional", index)}>
                    x
                  </button>
                </span>
              ))}
            </div>
            <button onClick={() => saveAndContinue("achievements")}>
              Save and Continue
            </button>
          </div>
        );
      case "achievements":
        return (
          <div className="form-section">
            <h2>Achievements</h2>
            <input
              type="text"
              placeholder="Add an achievement"
              value={newAchievement}
              onChange={(e) => setNewAchievement(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  addAchievement(newAchievement);
                }
              }}
            />
            <div className="achievements-list">
              {resumeData.achievements.map((achievement, index) => (
                <div key={index} className="achievement-item">
                  {achievement}
                  <button onClick={() => removeItem("achievements", index)}>
                    x
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => saveAndContinue("projects")}>
              Save and Continue
            </button>
          </div>
        );
      case "projects":
        return (
          <div className="form-section">
            <h2>Projects</h2>
            <input
              type="text"
              placeholder="Add a project"
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  addProject(newProject);
                }
              }}
            />
            <div className="projects-list">
              {resumeData.projects.map((project, index) => (
                <div key={index} className="project-item">
                  {project}
                  <button onClick={() => removeItem("projects", index)}>
                    x
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => saveAndContinue("extracurricular")}>
              Save and Continue
            </button>
          </div>
        );
      case "extracurricular":
        return (
          <div className="form-section">
            <h2>Extracurricular Activities</h2>
            <input
              type="text"
              placeholder="Add an extracurricular activity"
              value={newExtracurricular}
              onChange={(e) => setNewExtracurricular(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  addExtracurricular(newExtracurricular);
                }
              }}
            />
            <div className="extracurricular-list">
              {resumeData.extracurricular.map((activity, index) => (
                <div key={index} className="extracurricular-item">
                  {activity}
                  <button
                    onClick={() => removeItem("extracurricular", index)}
                  />
                </div>
              ))}
            </div>
            <button onClick={() => saveAndContinue("leadership")}>
              Save and Continue
            </button>
          </div>
        );
      case "leadership":
        return (
          <div className="form-section">
            <h2>Leadership</h2>
            <input
              type="text"
              placeholder="Add a leadership experience"
              value={newLeadership}
              onChange={(e) => setNewLeadership(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  addLeadership(newLeadership);
                }
              }}
            />
            <div className="leadership-list">
              {resumeData.leadership.map((experience, index) => (
                <div key={index} className="leadership-item">
                  {experience}
                  <button onClick={() => removeItem("leadership", index)}>
                    x
                  </button>
                  <button onClick={() => saveAndContinue("leadership")}>
                    Save and Continue
                  </button>
                </div>
              ))}
            </div>
            <button onClick={downloadPdf}>Download as PDF</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="resume-builder">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="resume-builder">
          <div className="resume-builder-sidebar">
            <button onClick={() => setActiveSection("basicInfo")}>
              Basic Info
            </button>
            <button onClick={() => setActiveSection("education")}>
              Education
            </button>
            <button onClick={() => setActiveSection("workExperience")}>
              Work Experience
            </button>
            <button onClick={() => setActiveSection("skills")}>Skills</button>
            <button onClick={() => setActiveSection("achievements")}>
              Achievements
            </button>
            <button onClick={() => setActiveSection("projects")}>
              Projects
            </button>
            <button onClick={() => setActiveSection("extracurricular")}>
              Extracurricular
            </button>
            <button onClick={() => setActiveSection("leadership")}>
              Leadership
            </button>
          </div>
          <div className="resume-builder-content">{renderForm()}</div>
          <div className="resume-preview" id="resume-preview">
            <div className="resume">
              <header>
                <h1>
                  {resumeData.basicInfo.firstName}{" "}
                  {resumeData.basicInfo.lastName}
                </h1>
                <p>
                  {resumeData.basicInfo.email} | {resumeData.basicInfo.contact}{" "}
                  | {resumeData.basicInfo.address}
                </p>
                <p>
                  {resumeData.basicInfo.linkedin} |{" "}
                  {resumeData.basicInfo.github}
                </p>
              </header>

              <section>
                <h2>OBJECTIVE</h2>
                <p>{resumeData.basicInfo.objective}</p>
              </section>

              <section>
                <h2>EDUCATION</h2>
                {resumeData.education.map((edu, index) => (
                  <div key={index}>
                    <h3>
                      {edu.degree} in {edu.fieldOfStudy}
                    </h3>
                    <p>
                      {edu.institute}, {edu.location}
                    </p>
                    <p>
                      {edu.startDate} - {edu.endDate}
                    </p>
                    {edu.cgpa && <p>CGPA: {edu.cgpa}</p>}
                  </div>
                ))}
              </section>

              <section>
                <h2>WORK EXPERIENCE</h2>
                {resumeData.workExperience.map((job, index) => (
                  <div key={index}>
                    <h3>
                      {job.designation} at {job.company}
                    </h3>
                    <p>
                      {job.startDate} - {job.endDate}
                    </p>
                  </div>
                ))}
              </section>

              <section>
                <h2>SKILLS</h2>
                <p>
                  <strong>Technical Skills:</strong>{" "}
                  {resumeData.skills.technical.join(", ")}
                </p>
                <p>
                  <strong>Soft Skills:</strong>{" "}
                  {resumeData.skills.soft.join(", ")}
                </p>
                <p>
                  <strong>Additional Skills:</strong>{" "}
                  {resumeData.skills.additional.join(", ")}
                </p>
              </section>

              <section>
                <h2>ACHIEVEMENTS</h2>
                <ul>
                  {resumeData.achievements.map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h2>PROJECTS</h2>
                <ul>
                  {resumeData.projects.map((project, index) => (
                    <li key={index}>{project}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h2>EXTRACURRICULAR ACTIVITIES</h2>
                <ul>
                  {resumeData.extracurricular.map((activity, index) => (
                    <li key={index}>{activity}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h2>LEADERSHIP</h2>
                <ul>
                  {resumeData.leadership.map((experience, index) => (
                    <li key={index}>{experience}</li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
          <div className="resume-builder-save">
            <button onClick={downloadPdf}>Download as PDF</button>
            <button onClick={deleteResume}>Delete Resume</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilderPage;
