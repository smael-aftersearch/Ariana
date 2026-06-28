import { Component, Route, signal } from '@ariana/core';

@Route('/animation-lab')
@Component({ selector: 'ari-admin-animation-lab-page', templateUrl: './animation-lab.page.html', styleUrl: './animation-lab.page.scss' })
export class AdminAnimationLabPage {
  readonly showPanel = signal(true);
  readonly showToast = signal(false);
  readonly rows = signal([
    { id: 'ANM-1001', name: 'Enter panel', state: 'Ready' },
    { id: 'ANM-1002', name: 'Leave panel', state: 'Ready' },
    { id: 'ANM-1003', name: 'Row animation', state: 'Ready' }
  ]);

  togglePanel() {
    this.showPanel.update(value => !value);
  }

  toggleToast() {
    this.showToast.update(value => !value);
  }

  addRow() {
    const index = this.rows().length + 1;
    this.rows.update(rows => [
      ...rows,
      { id: `ANM-${1000 + index}`, name: `Generated row ${index}`, state: 'New' }
    ]);
  }

  removeRow(id: string) {
    this.rows.update(rows => rows.filter(row => row.id !== id));
  }
}
