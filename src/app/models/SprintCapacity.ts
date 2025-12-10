export type ParticipantVacationDays = {
  participantName: string;
  vacationDays: number;
};

export type SprintCapacity = {
  workingDays: number;
  vacationDays: ParticipantVacationDays[];
  averageVelocity: number;
};

