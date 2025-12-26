const formatDateTime = (input) => {
  const date = new Date(input);

  // Handle invalid date
  if (isNaN(date.getTime())) {
    return null;
  }

  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  });

  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  return {
    date: formattedDate,
    time: formattedTime
  };
}

export default formatDateTime;