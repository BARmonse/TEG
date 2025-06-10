import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '../../../core/services/game.service';
import { GameDTO } from '../../../core/dto/game.dto';

@Component({
  selector: 'app-game-map',
  standalone: true,
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 to-purple-200">
      <div class="w-full max-w-5xl bg-white rounded-lg shadow-lg p-8">
        <div #svgContainer class="svg-container"></div>
      </div>
    </div>
  `
})
export class GameMapComponent implements OnInit, AfterViewInit {
  @ViewChild('svgContainer', { static: true }) svgContainer!: ElementRef;

  private playerColors: Record<string, string> = {
    RED: '#ef4444',
    BLUE: '#3b82f6',
    GREEN: '#22c55e',
    YELLOW: '#eab308',
    BLACK: '#111827',
    WHITE: '#f3f4f6',
  };

  private game: GameDTO | null = null;

  constructor(private route: ActivatedRoute, private gameService: GameService) {}

  ngOnInit() {
    const gameId = Number(this.route.snapshot.paramMap.get('id'));
    this.gameService.getGame(gameId).subscribe({
      next: (game: GameDTO) => {
        this.game = game;
        this.loadSvgMap();
      }
    });
  }

  ngAfterViewInit() {
    if (this.game) {
      this.loadSvgMap();
    }
  }

  private loadSvgMap() {
    fetch('assets/teg.map.svg')
      .then(res => res.text())
      .then(svgText => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = svgText;
        const svg = tempDiv.querySelector('svg');
        if (svg) {
          this.svgContainer.nativeElement.innerHTML = '';
          this.svgContainer.nativeElement.appendChild(svg);
          this.applyMapData(svg);
        }
      });
  }

  private applyMapData(svg: SVGSVGElement) {
    if (!this.game) return;
    for (const player of this.game.players) {
      if (player.countries) {
        for (const c of player.countries) {
          const countryElement = svg.querySelector(`#${CSS.escape(c.country)}`);
          if (countryElement) {
            countryElement.setAttribute('fill', this.playerColors[player.color] || '#e5e7eb');
            // Overlay troop count
            const bbox = (countryElement as SVGGraphicsElement).getBBox();
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', (bbox.x + bbox.width / 2).toString());
            text.setAttribute('y', (bbox.y + bbox.height / 2).toString());
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('alignment-baseline', 'middle');
            text.setAttribute('font-size', '20');
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('fill', this.playerColors[player.color] || '#111827');
            text.setAttribute('stroke', '#fff');
            text.setAttribute('stroke-width', '2');
            text.textContent = c.troops.toString();
            svg.appendChild(text);
          }
        }
      }
    }
  }
} 