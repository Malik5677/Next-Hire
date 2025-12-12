import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { FaEnvelope, FaChartLine, FaFileAlt, FaRegChartBar, FaSignOutAlt, FaCog, FaUser, FaSun, FaMoon, FaCamera, FaUpload } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from "chart.js";
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(32px);}
  to { opacity: 1; transform: none;}
`;

const Wrapper = styled.div`
  background: ${({ theme }) => theme === "dark" ? "#182245" : "#f7f9fd"};
  min-height: 100vh;
  font-family: 'Inter','Poppins','Montserrat','Arial',sans-serif;
  display: flex;
  color: ${({ theme }) => theme === "dark" ? "#eaf6fb" : "#182245"};
  transition: background 0.3s;
`;

const Sidebar = styled.div`
  background: ${({ theme }) => theme === "dark" ? "#242b41" : "#fff"};
  border-right: 1.5px solid #eef2fa;
  min-width: 235px;
  padding: 32px 16px 20px 24px;
  box-shadow: 3px 0 18px #6ecbff11;
  display: flex; flex-direction: column; justify-content: space-between;
  animation: ${fadeIn} .62s;
  @media (max-width: 900px) { min-width: 76px; padding: 22px 2px 15px 5px;}
`;

const SideList = styled.ul`
  list-style: none; padding: 0; margin-top: 10px;
  & li { display: flex; align-items: center; gap: 10px; font-size: 1.09rem; padding: 15px 5px; cursor:pointer; border-radius:8px; transition:background .19s;}
  & li.active, & li:hover { background: #edf7fd; color: #14b2ff;}
  & .side-label {font-weight: 600;}
`;

const SideTitle = styled.h1`
  color: #15beff; font-size: 2.1rem; font-weight: 700; margin-bottom: 26px;
`;

const Main = styled.div`
  flex: 1;
  padding: 38px 38px 0 38px;
  min-height: 100vh;
  animation: ${fadeIn} .8s cubic-bezier(.77,.35,.45,1.02);
  @media (max-width: 900px) { padding:18px 5px 0 5px; }
`;

const ProfileRow = styled.div`
  display: flex; align-items: center; gap: 30px;
  margin-bottom: 30px; flex-wrap: wrap;
`;

const ProfileCard = styled.div`
  background: ${({ theme }) => theme === "dark" ? "#21293B" : "#fff"}; border-radius: 17px; box-shadow: 0 2px 22px #15beff13, 0 1px 4px #23e3ff0a;
  padding: 34px 54px 34px 20px;
  min-width: 340px; max-width: 420px; display: flex; flex-direction: row; gap:24px; align-items: center;
  animation: ${fadeIn} .8s; @media (max-width:900px){padding:19px 12px;flex-direction:column;}
`;

const ProfileImg = styled.div`
  position: relative;
  width: 78px; height: 78px; border-radius:15px; background: #eaf6ff;
  overflow:hidden; display:flex; align-items:center; justify-content:center;
  img { width:100%; height:100%; object-fit:cover;}
  svg { width:61px; height:61px; color: #14b2ff;}
`;

const ImgButton = styled.button`
  position: absolute; bottom: 4px; right: 4px; background: #15beff; color: #fff;
  border: none; border-radius: 50%; padding: 6px; cursor: pointer;
  box-shadow: 0 0 8px #13bfff88; display: flex; align-items: center; justify-content: center;
  &:hover { background: #048fff; }
`;

const HiddenInput = styled.input`
  display: none;
`;

const InfoSection = styled.div`
  flex:1; display:flex; flex-direction:column; gap: 8px;
  .profile-name { font-size:2.08rem;font-weight:700;color:#15beff;}
  .profile-title { font-size:1.09rem;font-weight:600;color:#138bf2; }
  .profile-badges { margin:8px 0 0 0;}
  .badge { background: #e3ffec; color:#21e36c; padding:4px 11px;border-radius:10px;font-size:.96rem;font-weight:600;margin-right:12px;}
`;

const AnalyticsPanel = styled.div`
  background: ${({ theme }) => theme === "dark" ? "#21293B" : "#fff"}; border-radius: 17px; box-shadow: 0 2px 22px #15beff18;
  padding: 34px 28px 30px 28px; margin-bottom: 38px; animation: ${fadeIn} .8s;
`;

const AnalyticsTitle = styled.div`
  font-size: 1.45rem; font-weight: 700; color: #14b2ff; margin-bottom: 21px; letter-spacing: -1px;
`;

const ScoreCardsRow = styled.div`
  display:flex; gap:22px; flex-wrap:wrap; margin-bottom:10px;
`;

const ScoreCard = styled.div`
  background:linear-gradient(108deg,#e3f7ff 50%,${({ theme }) => theme === "dark" ? "#21293B" : "#fff"} 100%);
  border-radius:13px; padding:20px 34px 20px 20px;
  box-shadow:0 1px 6px #13bfff0c; font-weight:700; font-size:1.07rem; color:#14b2ff;
  text-align:left; min-width:170px; flex:1; display:flex; align-items:center; gap:13px;
  .score-label {font-size:.96rem;color:#444;}
  .score-value {font-size:2.18rem;color:#21aaff;font-weight:700;}
  svg{font-size:2.3rem;}
`;

const ChartCard = styled.div`
  background:${({ theme }) => theme === "dark" ? "#21293B" : "#fff"}; border-radius:14px; box-shadow:0 5px 20px #14b2ff0a;
  padding:18px 20px; margin-top:14px;`;

const RecList = styled.div`
  background: ${({ theme }) => theme === "dark" ? "#21293B" : "#fff"};
  border-radius: 14px; box-shadow:0 2px 10px #13bfff0e;
  padding: 22px 20px; min-width:270px; max-width:350px; font-size:1.05rem; margin-left: 12px;
`;

const ModalOverlay = styled.div`
  position:fixed; top:0; left:0; right:0; bottom:0; z-index:555;
  display:flex; align-items:center; justify-content:center;
  background:rgba(15,190,255,.27);
  backdrop-filter: blur(9px);
  transition: background .3s;
`;

const ModalBox = styled.div`
  background:#fff; border-radius:16px; box-shadow:0 8px 38px #13bfff33;
  padding:36px 40px; min-width:310px; animation:${fadeIn} .45s;
`;

const ThemeToggle = styled.div`
  font-size:1.5rem;cursor:pointer; transition:color .23s;
  &:hover { color:#15beff; }
`;

const Label = styled.label`
  font-weight:600;display:block;margin-bottom:7px;
`;

const Input = styled.input`
  width:100%;padding:9px 13px;border-radius:9px;border:1px solid #e3e3e3;font-size:.97rem;margin-bottom:16px;
`;

const Select = styled.select`
  width:100%;padding:9px 13px;border-radius:9px;border:1px solid #e3e3e3;font-size:.97rem;margin-bottom:16px;
`;

const ModalTitle = styled.div`
  font-size:1.21rem;font-weight:700;color:#14b2ff;margin-bottom:12px;
`;

const CTAButton = styled.button`
  margin:16px 4px 0 0; padding:14px 30px; background:linear-gradient(90deg,#15beff 65%,#04d8fc 100%);
  border:none;border-radius:18px; color:#14213c;font-weight:700;font-size:1.09rem;cursor:pointer;
  box-shadow:0 3px 14px #15beff63;
  &:hover {transform:scale(1.08);box-shadow:0 8px 28px #04d8fc99;}
  transition:transform .07s,box-shadow .10s;
`;

const sectionSpacing = { marginBottom: "23px" };

const jobOptions = [
  "Software Engineer","Web Developer","Data Scientist","HR Manager","Marketing Specialist","Finance Analyst",
  "Sales Executive","Product Designer","DevOps Engineer","AI/ML Engineer","UX Researcher","IT Support",
  "Content Creator","Project Manager","Business Analyst","Cybersecurity Specialist","Mobile Developer","Digital Marketer",
  "Customer Success","Accountant","Network Engineer","Frontend Engineer","Backend Engineer","Full Stack Developer"
];

const chartData = (atsScore, interviewScore, mockScore) => ({
  labels: ['Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'],
  datasets: [
    {
      label: 'ATS Score',
      data: [65,62,atsScore,76,77,81,73,atsScore],
      fill:false,backgroundColor:'#21aaff',borderColor:'#14b2ff',tension:0.3,pointHoverRadius:7
    },
    {
      label: 'Interview Score',
      data: [55,61,interviewScore,74,67,75,72,interviewScore],
      fill:false,backgroundColor:'#21e36c',borderColor:'#21e36c',tension:0.3,pointHoverRadius:7
    },
    {
      label: 'Mock Interview Score',
      data: [47,59,mockScore,71,65,68,70,mockScore],
      fill:false,backgroundColor:'#FFD66C',borderColor:'#FFD66C',tension:0.3,pointHoverRadius:7
    },
  ]
});

const chartOptions = {
  responsive:true,
  plugins:{legend:{position:'top',labels:{font:{size:15}}},tooltip:{enabled:true,backgroundColor:"#14b2ff",titleColor:"#fff"}},
  scales:{y:{min:30,max:100,ticks:{color:'#13bfff',font:{size:13}}},x:{ticks:{color:'#21aaff',font:{size:13}}}}
};

const initialProfile = {
  name: "", username: "", age: "", phone: "", jobRole: jobOptions[0], image: ""
};

const initialScores = { atsScore: 80, interviewScore: 76, mockScore: 73 };

const inboxDemoUsers = [
  {username:"camwillson",name:"Cameron Willson",role:"Marketing Specialist"},
  {username:"hrmanager",name:"Ritu Aggarwal",role:"HR Manager"},
  {username:"datasci",name:"Manoj Patel",role:"Data Scientist"}
];

export default function Dashboard() {
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [profile, setProfile] = useState(initialProfile);
  const [showSettings, setShowSettings] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeStep, setWelcomeStep] = useState(0); // Step-by-step onboarding
  const welcomeOrder = ["name","username","age","phone","jobRole"];
  const [scores, setScores] = useState(initialScores);
  const [theme, setTheme] = useState("light");
  const [inboxSearch, setInboxSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [resumeName, setResumeName] = useState("");
  const imgInputRef = useRef();

  useEffect(() => {
    if (!profile.name) setShowWelcome(true);
    // eslint-disable-next-line
  }, []);

  // Handle image change
  function handleImgUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setProfile(profile => ({ ...profile, image: ev.target.result }));
    reader.readAsDataURL(file);
  }

  // --- Onboarding (step by step, no email)
  function handleWelcomeNext(e) {
    e.preventDefault();
    if (welcomeStep < welcomeOrder.length - 1) {
      setWelcomeStep(welcomeStep + 1);
    } else {
      setShowWelcome(false);
    }
  }

  function welcomeLabel(k) {
    switch(k){
      case "name": return "Enter your Name";
      case "username": return "Choose a Username";
      case "age": return "Enter your Age";
      case "phone": return "Enter your Phone Number";
      case "jobRole": return "Select your Job Role";
      default: return "";
    }
  }

  // --- Resume upload ---
  function handleResumeUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setResumeName(file.name);
  }

  // --- Tabs ---
  function renderMain() {
    if (currentTab === "dashboard") {
      return (
        <>
          <ProfileRow style={sectionSpacing}>
            <ProfileCard theme={theme}>
              <ProfileImg>
                {profile.image ?
                  <img src={profile.image} alt="profile" />
                  :
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="default-profile" />
                }
                <ImgButton type="button" title="Change Image" onClick={()=>imgInputRef.current.click()}>
                  <FaCamera />
                  <HiddenInput
                    ref={imgInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handleImgUpload}
                  />
                </ImgButton>
              </ProfileImg>
              <InfoSection>
                <div className="profile-name">{profile.name || "No Name Set"}</div>
                <div className="profile-title">{profile.jobRole || "Role"} <span style={{color:"#78efb5",marginLeft:6}}>Active</span></div>
                <div style={{fontWeight:600,fontSize:'.94rem'}}>{profile.username?"@"+profile.username:""}</div>
                <div style={{fontSize:'.97rem'}}>{profile.phone || "-"}</div>
                <div className="profile-badges" style={{marginTop:"9px"}}>
                  <span className="badge">Score: {scores.atsScore + scores.interviewScore + scores.mockScore}</span>
                </div>
              </InfoSection>
            </ProfileCard>
            <RecList theme={theme}>
              <b style={{fontWeight:700,fontSize:'1.1rem'}}>Recommended</b><br />
              <div style={{margin:'10px 0 0 0'}}>Design update for resume analysis</div>
              <div style={{color:"#aaa",fontSize:".95rem",margin:"7px 0"}}>by System • 6 days ago</div>
              <hr style={{margin:"7px 0",borderColor:"#edf7ff"}} />
              <div>AI webinar next week</div>
              <div style={{color:"#aaa",fontSize:".95rem",margin:"7px 0"}}>by HR Team • 2 days ago</div>
            </RecList>
          </ProfileRow>
          <AnalyticsPanel theme={theme}>
            <AnalyticsTitle>Candidate Analytics & Scores</AnalyticsTitle>
            <ScoreCardsRow>
              <ScoreCard theme={theme}><FaRegChartBar /><span className="score-label">ATS Score</span>
                <span className="score-value">{scores.atsScore}</span>
              </ScoreCard>
              <ScoreCard theme={theme}><FaChartLine /><span className="score-label">Interview Score</span>
                <span className="score-value">{scores.interviewScore}</span>
              </ScoreCard>
              <ScoreCard theme={theme}><FaChartLine /><span className="score-label">Mock Score</span>
                <span className="score-value">{scores.mockScore}</span>
              </ScoreCard>
            </ScoreCardsRow>
            <ChartCard theme={theme}>
              <Line data={chartData(scores.atsScore, scores.interviewScore, scores.mockScore)} options={chartOptions} />
            </ChartCard>
          </AnalyticsPanel>
        </>
      );
    }
    if (currentTab === "inbox") {
      return (
        <AnalyticsPanel theme={theme}>
          <AnalyticsTitle>Inbox & Messaging</AnalyticsTitle>
          <div style={{marginBottom:16,fontWeight:600}}>Search users by username:</div>
          <Input
            value={inboxSearch}
            onChange={e => setInboxSearch(e.target.value)}
            placeholder="Type username..."
          />
          <div style={{marginTop:16}}>
            {inboxDemoUsers
              .filter(u => u.username.includes(inboxSearch))
              .map(u =>
                <div key={u.username} style={{
                  background:"#f3f9fd",padding:"10px 24px",marginBottom:"9px",
                  borderRadius:"10px",cursor:"pointer",fontWeight:600
                }}
                  onClick={()=>setSelectedUser(u)}>
                  <FaUser style={{color:"#14b2ff",marginRight:7}}/>
                  @{u.username} - {u.role}
                </div>
              )
            }
            {inboxSearch && inboxDemoUsers.filter(u=>u.username.includes(inboxSearch)).length === 0 && (
              <div style={{color:"#888",fontSize:"1rem"}}>No user found</div>
            )}
          </div>
          {selectedUser && (
            <ModalOverlay>
              <ModalBox>
                <ModalTitle>Chat with {selectedUser.name}</ModalTitle>
                <div style={{marginBottom:14,fontWeight:"500"}}>
                  Start a conversation with <b>@{selectedUser.username}</b>.
                </div>
                <Input placeholder="Type your message..." />
                <div>
                  <CTAButton onClick={()=>setSelectedUser(null)}>Close</CTAButton>
                  <CTAButton>Send</CTAButton>
                </div>
              </ModalBox>
            </ModalOverlay>
          )}
        </AnalyticsPanel>
      );
    }
    if (currentTab === "ats") {
      return (
        <AnalyticsPanel theme={theme}>
          <AnalyticsTitle>ATS Reports</AnalyticsTitle>
          <ChartCard theme={theme}>
            <Line data={chartData(scores.atsScore, scores.interviewScore, scores.mockScore)} options={chartOptions} />
          </ChartCard>
        </AnalyticsPanel>
      );
    }
    if (currentTab === "resumes") {
      return (
        <AnalyticsPanel theme={theme}>
          <AnalyticsTitle>Uploaded Resumes</AnalyticsTitle>
          <div style={{fontWeight:"500",marginBottom:"17px"}}>
            {resumeName ? (
              <>Uploaded file: <b>{resumeName}</b></>
            ) : (
              <>No resumes uploaded yet.</>
            )}
          </div>
          <CTAButton as="label" htmlFor="file-upload">
            <FaUpload style={{marginRight:7}}/>Upload Resume
          </CTAButton>
          <HiddenInput
            id="file-upload"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeUpload}
          />
        </AnalyticsPanel>
      );
    }
    return null;
  }

  // --- Main UI ---
  return (
    <Wrapper theme={theme}>
      <Sidebar theme={theme}>
        <div>
          <SideTitle>Hire IQ</SideTitle>
          <SideList>
            <li className={currentTab==="dashboard"?"active":""}
              onClick={()=>setCurrentTab("dashboard")}><FaChartLine/> <span className="side-label">Dashboard</span></li>
            <li className={currentTab==="inbox"?"active":""}
              onClick={()=>setCurrentTab("inbox")}><FaEnvelope/> <span className="side-label">Inbox</span></li>
            <li className={currentTab==="ats"?"active":""}
              onClick={()=>setCurrentTab("ats")}><FaRegChartBar/> <span className="side-label">ATS Reports</span></li>
            <li className={currentTab==="resumes"?"active":""}
              onClick={()=>setCurrentTab("resumes")}><FaFileAlt/> <span className="side-label">Resumes</span></li>
          </SideList>
        </div>
        <div>
          <SideList>
            <li onClick={()=>setShowSettings(true)}><FaCog/> <span className="side-label">Settings</span></li>
            <li><FaSignOutAlt/> <span className="side-label">Sign Out</span></li>
          </SideList>
        </div>
      </Sidebar>
      <Main>{renderMain()}</Main>

      {/* Animated settings pop-up with theme switcher and image update */}
      {showSettings && (
        <ModalOverlay>
          <ModalBox>
            <ModalTitle>Edit Profile</ModalTitle>
            <form onSubmit={e => {e.preventDefault(); setShowSettings(false);}}>
              <Label>Name</Label>
              <Input type="text" value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})} required />
              <Label>Username</Label>
              <Input type="text" value={profile.username} onChange={e=>setProfile({...profile,username:e.target.value})} required />
              <Label>Phone</Label>
              <Input type="text" value={profile.phone} onChange={e=>setProfile({...profile,phone:e.target.value})} required />
              <Label>Date of Birth</Label>
              <Input type="date" />
              <Label>Job Role</Label>
              <Select value={profile.jobRole} onChange={e=>setProfile({...profile,jobRole:e.target.value})}>
                {jobOptions.map(j=><option key={j} value={j}>{j}</option>)}
              </Select>
              <Label>Change Profile Image</Label>
              <CTAButton type="button" onClick={()=>imgInputRef.current.click()} style={{marginBottom:10}}>
                <FaCamera style={{marginRight:7}}/>Upload or Capture Image
              </CTAButton>
              <HiddenInput
                ref={imgInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleImgUpload}
              />
              <Label>Theme</Label>
              <ThemeToggle onClick={()=>setTheme(theme==="dark"?"light":"dark")}>
                {theme==="dark"?<FaSun/>:<FaMoon/>} Switch to {theme==="dark"?"Light":"Dark"} Mode
              </ThemeToggle>
              <CTAButton type="submit">Save</CTAButton>
              <CTAButton type="button" style={{background:"#888",color:"#fff"}} onClick={()=>setShowSettings(false)}>Cancel</CTAButton>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}

      {/* Step-by-step welcome onboarding pop-up (no email) */}
      {showWelcome && (
        <ModalOverlay>
          <ModalBox>
            <ModalTitle>{welcomeLabel(welcomeOrder[welcomeStep])}</ModalTitle>
            <form onSubmit={handleWelcomeNext}>
              {welcomeOrder[welcomeStep] !== "jobRole" ? (
                <Input
                  type={welcomeOrder[welcomeStep] === "age" ? "number" : "text"}
                  value={profile[welcomeOrder[welcomeStep]]}
                  onChange={e=>setProfile({...profile,[welcomeOrder[welcomeStep]]:e.target.value})}
                  autoFocus required
                  placeholder={welcomeLabel(welcomeOrder[welcomeStep])}
                />
              ) : (
                <Select
                  value={profile.jobRole}
                  onChange={e=>setProfile({...profile,jobRole:e.target.value})}
                >
                  {jobOptions.map(j=><option key={j} value={j}>{j}</option>)}
                </Select>
              )}
              <CTAButton type="submit">{welcomeStep<welcomeOrder.length-1?"Next":"Finish"}</CTAButton>
            </form>
          </ModalBox>
        </ModalOverlay>
      )}
    </Wrapper>
  );
}
