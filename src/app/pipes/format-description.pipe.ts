import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'formatDescription',
  standalone: true
})
export class FormatDescriptionPipe implements PipeTransform {

  // On injecte le DomSanitizer pour s'assurer que le HTML est sûr
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): SafeHtml {
    if (!value) {
      return '';
    }

    // 1. Diviser le texte en lignes
    const lines = value.split('\n');

    // 2. Transformer chaque ligne
    const formattedLines = lines.map(line => {
      const trimmedLine = line.trim();

      // Si la ligne est vide, on la transforme en un saut de paragraphe
      if (trimmedLine === '') {
        return '<br>';
      }

      // Si la ligne ne contient pas de puce (•, *, -) et se termine par ':' ou est courte (moins de 25 caractères),
      // on la considère comme un titre de section.
      if (!trimmedLine.startsWith('•') && !trimmedLine.startsWith('*') && !trimmedLine.startsWith('-') && (trimmedLine.endsWith(':') || trimmedLine.length < 25)) {
        return `<strong>${trimmedLine}</strong>`;
      }

      // Si la ligne commence par une puce, on la transforme en un élément de liste
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('*') || trimmedLine.startsWith('-')) {
        // On enlève la puce du début et on nettoie les espaces
        const listItemText = trimmedLine.substring(1).trim();
        return `<li style="margin-left: 20px;">${listItemText}</li>`;
      }

      // Sinon, c'est un paragraphe normal
      return `<p>${trimmedLine}</p>`;
    });

    // 3. Rejoindre les lignes transformées en un seul bloc HTML
    const fullHtml = formattedLines.join('');

    // 4. "Sanitiser" le HTML pour le protéger contre les attaques XSS avant de l'insérer dans la page
    return this.sanitizer.bypassSecurityTrustHtml(fullHtml);
  }
}
