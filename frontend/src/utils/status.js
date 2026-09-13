export function statusClass(status) {
  return (status || "").toLowerCase().replace(/\s+/g, "-");
}

export function isInterviewStage(status) {
  return status === "Interview" || status === "Technical Round";
}
