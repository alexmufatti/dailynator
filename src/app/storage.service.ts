import { Injectable, signal } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { Participant } from './models/Participant';
import { Team } from './models/Team';
import { DailySubtitleConfigService } from './services/daily-subtitleConfig.service';
import type { DailySubtitleSourceType } from './models/DailySubtitleSourceType';
import { SprintCapacity } from './models/SprintCapacity';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly teamsKey = 'teams';
  private readonly activeTeamKey = 'activeTeamId';
  private readonly teamsSignal = signal<Team[]>([]);
  private readonly activeTeamIdSignal = signal<string>('');

  constructor(private dailySubtitleConfig: DailySubtitleConfigService) {
    this.loadState();
  }

  private loadState() {
    const rawTeams = localStorage.getItem(this.teamsKey);
    const rawActiveId = localStorage.getItem(this.activeTeamKey);
    const legacyPeople = localStorage.getItem('people');

    if (!rawTeams) {
      const defaultTeam = this.createDefaultTeam({
        participants: legacyPeople ? JSON.parse(legacyPeople) : []
      });
      this.persistState([defaultTeam], defaultTeam.id);
      localStorage.removeItem('people');
      localStorage.removeItem('project');
      return;
    }

    let teams: Team[] = JSON.parse(rawTeams);
    if (!Array.isArray(teams) || !teams.length) {
      const defaultTeam = this.createDefaultTeam();
      this.persistState([defaultTeam], defaultTeam.id);
      return;
    }

    const defaultSource = this.dailySubtitleConfig.getConfig().source;

    teams = teams.map((team) => ({
      id: team.id ?? uuidv4(),
      name: team.name ?? 'Team 1',
      participants: Array.isArray(team.participants) ? team.participants : [],
      subtitleSource: team.subtitleSource ?? defaultSource,
      sprintCapacity: team.sprintCapacity,
    }));

    const fallbackActiveId = teams[0].id;
    this.persistState(teams, rawActiveId ?? fallbackActiveId);
  }

  private createDefaultTeam(data?: Partial<Omit<Team, 'id' | 'name'>>) : Team {
    const defaultSource = this.dailySubtitleConfig.getConfig().source;
    return {
      id: uuidv4(),
      name: 'Team 1',
      participants: data?.participants ?? [],
      subtitleSource: data?.subtitleSource ?? defaultSource,
    };
  }

  private persistState(teams: Team[], activeId: string) {
    localStorage.setItem(this.teamsKey, JSON.stringify(teams));
    localStorage.setItem(this.activeTeamKey, activeId);
    this.teamsSignal.set(teams);
    this.activeTeamIdSignal.set(activeId);
  }

  getTeams() {
    return this.teamsSignal.asReadonly();
  }

  getActiveTeamId() {
    return this.activeTeamIdSignal.asReadonly();
  }

  private get teams(): Team[] {
    return this.teamsSignal();
  }

  private get activeTeamId(): string {
    return this.activeTeamIdSignal();
  }

  private updateTeams(mutator: (teams: Team[]) => Team[]) {
    let updated = mutator(this.teams.slice());
    if (!updated.length) {
      updated = [this.createDefaultTeam()];
    }
    const activeId = updated.find((team) => team.id === this.activeTeamId)?.id ?? updated[0].id;
    this.persistState(updated, activeId);
  }

  addTeam(name: string) {
    const trimmed = name.trim();
    const team: Team = {
      id: uuidv4(),
      name: trimmed || `Team ${this.teams.length + 1}`,
      participants: [],
      subtitleSource: this.dailySubtitleConfig.getConfig().source,
    };
    this.updateTeams((teams) => [...teams, team]);
    this.setActiveTeam(team.id);
  }

  renameTeam(id: string, name: string) {
    this.updateTeams((teams) => teams.map((team) => (team.id === id ? { ...team, name } : team)));
  }

  deleteTeam(id: string) {
    if (this.teams.length === 1) {
      return;
    }
    this.updateTeams((teams) => teams.filter((team) => team.id !== id));
  }

  setActiveTeam(id: string) {
    if (this.teams.some((team) => team.id === id)) {
      localStorage.setItem(this.activeTeamKey, id);
      this.activeTeamIdSignal.set(id);
    }
  }

  private patchTeam(id: string, updater: (team: Team) => Team) {
    this.updateTeams((teams) => teams.map((team) => (team.id === id ? updater(team) : team)));
  }

  getActiveTeam(): Team | undefined {
    return this.teams.find((team) => team.id === this.activeTeamId);
  }

  getTeam(id: string): Team | undefined {
    return this.teams.find((team) => team.id === id);
  }

  getPeople(): Participant[] {
    return this.getActiveTeam()?.participants ?? [];
  }

  setPeople(people: Participant[]) {
    if (!this.activeTeamId) {
      this.addTeam('Team 1');
    }
    this.patchTeam(this.activeTeamId, (team) => ({ ...team, participants: people }));
  }

  setTeamSubtitleSource(id: string, source: DailySubtitleSourceType) {
    this.patchTeam(id, (team) => ({ ...team, subtitleSource: source }));
  }

  setTeamSprintCapacity(id: string, capacity: SprintCapacity) {
    this.patchTeam(id, (team) => ({ ...team, sprintCapacity: capacity }));
  }

  getTeamSprintCapacity(id: string): SprintCapacity | undefined {
    return this.getTeam(id)?.sprintCapacity;
  }
}
