import { Injectable } from '@nestjs/common';
import { ScoreService } from './score.service';

@Injectable()
export class ScoreServiceImpl implements ScoreService {
  calculateScore(stars: number, forks: number, updatedAt: Date) {

    const updatedAtDate = new Date(updatedAt);
    const recencyDays = Math.floor((Date.now() - updatedAtDate.getTime()) / (1000 * 60 * 60 * 24));

    const starWeight = 0.5;
    const forkWeight = 0.3;
    const recencyWeight = 0.25;

    const recencyFactor = Math.max(0, 100 - recencyDays) * recencyWeight;

    return (stars * starWeight) + (forks * forkWeight) + recencyFactor;
  }
}