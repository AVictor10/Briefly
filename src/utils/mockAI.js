// Mock AI function to simulate summary generation
export const createMockSummary = (transcript, prompt) => {
  const wordCount = transcript.split(/\s+/).length;
  const lines = transcript.split('\n').filter(line => line.trim());
  const promptLower = prompt.toLowerCase();
  
  let summary = '';
  
  if (promptLower.includes('bullet') || promptLower.includes('executive')) {
    summary = `EXECUTIVE SUMMARY\n\n`;
    summary += `• Meeting covered ${Math.ceil(wordCount / 100)} main topics\n`;
    summary += `• Key decisions were made regarding project timeline\n`;
    summary += `• Budget allocation was discussed and approved\n`;
    summary += `• Next steps were clearly defined\n`;
    summary += `• Follow-up meeting scheduled for next week\n\n`;
    summary += `Total discussion points: ${lines.length}\n`;
    summary += `Meeting duration: Approximately ${Math.ceil(wordCount / 150)} minutes`;
    
  } else if (promptLower.includes('action')) {
    summary = `ACTION ITEMS\n\n`;
    summary += `1. Finalize project timeline - Due: End of week\n`;
    summary += `2. Prepare budget report - Due: Monday\n`;
    summary += `3. Schedule stakeholder meeting - Due: Wednesday\n`;
    summary += `4. Update project documentation - Due: Friday\n`;
    summary += `5. Send meeting notes to all participants - Due: Tomorrow\n\n`;
    summary += `FOLLOW-UP REQUIRED:\n`;
    summary += `- Weekly status updates\n`;
    summary += `- Resource allocation review\n`;
    summary += `- Client feedback collection`;
    
  } else {
    summary = `MEETING SUMMARY\n\n`;
    summary += `This meeting transcript contained ${wordCount} words across ${lines.length} speaking segments. `;
    summary += `The discussion covered various important topics and resulted in several key outcomes.\n\n`;
    summary += `KEY POINTS DISCUSSED:\n`;
    summary += `- Project status and current milestones\n`;
    summary += `- Resource allocation and timeline adjustments\n`;
    summary += `- Team feedback and concerns\n`;
    summary += `- Budget considerations\n`;
    summary += `- Future planning and next steps\n\n`;
    summary += `OUTCOMES:\n`;
    summary += `- Clear action items were established\n`;
    summary += `- Responsibilities were assigned\n`;
    summary += `- Timeline was confirmed\n`;
    summary += `- Next meeting was scheduled\n\n`;
    summary += `This summary was generated based on your custom instructions: "${prompt}"`;
  }
  
  return summary;
};