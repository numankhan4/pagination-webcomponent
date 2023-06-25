import { customElement, property, state } from 'lit/decorators.js';
import { css, html, LitElement } from 'lit';
interface FilterCriteria {
  // Define your filter criteria properties here
}
type DataFormatter = (item: any) => string;

export class Em9Pagination extends LitElement {
  static styles = css`
    .pagination button {
  padding: 6px 12px;
  margin: 0 4px;
  border: 1px solid #ddd;
  background-color: #fff;
  color: #333;
  cursor: pointer;
  font-size: 14px;
}

.pagination .page-number {
  padding: 6px 12px;
  margin: 0 4px;
  border: 1px solid #ddd;
  background-color: #fff;
  color: #333;
  cursor: pointer;
}

.pagination .page-number.active {
  background-color: #007bff;
  color: #fff;
  border-color: #007bff;
}
.pagination-controls input[type='text'] {
  width: 48px;
  padding: 4px;
  margin: 0 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
}

.pagination-controls select {
  padding: 4px 8px;
  margin: 0 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.pagination-controls .page-number {
  padding: 4px;
  margin: 0 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.pagination-controls .page-number.active {
  background-color: #f5f5f5;
}

.filtering-options {
  margin-bottom: 16px;
}

.filtering-options input[type='text'] {
  width: 200px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.sorting-options {
  margin-bottom: 16px;
}

.sorting-options select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-functionality input[type='text'] {
  width: 200px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-functionality ul {
  list-style-type: none;
  padding: 0;
}

.search-functionality li {
  margin-bottom: 8px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

  `;

@property({ type: Array }) data: any[] = [];
@property({ type: Number }) currentPage = 1;
@property({ type: Number }) itemsPerPage = 10;
@property({ type: Object }) filters: FilterCriteria = {};
@property({ type: String }) sortColumn = '';
@property({ type: String }) sortDirection = 'asc';
@property({ type: String }) searchKeyword = '';
@property({ type: Array }) renderProps: string[] = [];
@property({ type: Function }) dataFormatter: DataFormatter | null = null;




  constructor() {
    super();
    this.data = [];
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.filters = {};
    this.sortColumn = '';
    this.sortDirection = 'asc';
    this.searchKeyword = '';
    this.renderProps = [];
    this.dataFormatter = null; // Default value is null
  }

  render() {
    const filteredData = this.applyFilters();
    const sortedData = this.applySorting(filteredData);
    const paginatedData = this.applyPagination(sortedData);
    const totalPages = Math.ceil(filteredData.length / this.itemsPerPage);

    return html`
      <div class="sorting-options">
        <select @change="${this.changeSort}">
          <option value="">Sort By</option>
          <option value="name">Name</option>
          <option value="age">Age</option>
          <!-- Add more options for other sortable columns -->
        </select>
        <select @change="${this.changeSortDirection}">
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      <div class="pagination ${this.getLayoutClass()}">
      <button @click="${this.previousPage}">Previous</button>
      ${this.renderPageNumbers(totalPages)}
      <button @click="${this.nextPage}">Next</button>
      <select @change="${this.changeItemsPerPage}">
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
      </select>
    </div>

      <div class="filtering-options">
        <!-- Implement your filtering options here -->
      </div>

      <div class="sorting-options">
        <!-- Implement your sorting UI here -->
      </div>

      <div class="search-functionality">
        <input type="text" .value="${this.searchKeyword}" @input="${this.search}" />
        <ul>
          ${paginatedData.map((item) => html`<li>${this.renderItem(item)}</li>`)}
        </ul>
      </div>
    `;
  }

  renderPageNumbers(totalPages: number) {
    const currentPage = this.currentPage;

    if (totalPages <= 5) {
      // Render all page numbers if total pages are less than or equal to 5
      return html`
        ${Array.from({ length: totalPages }, (_, index) => {
          const pageNumber = index + 1;
          return html`
            <span
              class="page-number ${pageNumber === currentPage ? 'active' : ''}"
              @click="${() => this.goToPage(pageNumber)}"
            >
              ${pageNumber}
            </span>
          `;
        })}
      `;
    } else {
      // Render dotted options for larger total pages
      const firstPage = html`
        <span
          class="page-number ${currentPage === 1 ? 'active' : ''}"
          @click="${() => this.goToPage(1)}"
        >
          1
        </span>
      `;
      const lastPage = html`
        <span
          class="page-number ${currentPage === totalPages ? 'active' : ''}"
          @click="${() => this.goToPage(totalPages)}"
        >
          ${totalPages}
        </span>
      `;

      if (currentPage <= 3) {
        // Render first 3 pages and the last page with dotted options
        const middlePages = Array.from({ length: 3 }, (_, index) => {
          const pageNumber = index + 2;
          return html`
            <span
              class="page-number ${pageNumber === currentPage ? 'active' : ''}"
              @click="${() => this.goToPage(pageNumber)}"
            >
              ${pageNumber}
            </span>
          `;
        });

        return html`
          ${firstPage}${middlePages}<span>...</span>${lastPage}
        `;
      } else if (currentPage >= totalPages - 2) {
        // Render the first page with dotted options and the last 3 pages
        const middlePages = Array.from({ length: 3 }, (_, index) => {
          const pageNumber = totalPages - 2 + index;
          return html`
            <span
              class="page-number ${pageNumber === currentPage ? 'active' : ''}"
              @click="${() => this.goToPage(pageNumber)}"
            >
              ${pageNumber}
            </span>
          `;
        });

        return html`
          ${firstPage}<span>...</span>${middlePages}${lastPage}
        `;
      } else {
        // Render dotted options in the middle
        const previousPage = html`
          <span
            class="page-number ${currentPage === currentPage - 1 ? 'active' : ''}"
            @click="${() => this.goToPage(currentPage - 1)}"
          >
            ${currentPage - 1}
          </span>
        `;
        const nextPage = html`
          <span
            class="page-number ${currentPage === currentPage + 1 ? 'active' : ''}"
            @click="${() => this.goToPage(currentPage + 1)}"
          >
            ${currentPage + 1}
          </span>
        `;

        return html`
          ${firstPage}<span>...</span>${previousPage}<span>${currentPage}</span>${nextPage}<span>...</span>${lastPage}
        `;
      }
    }
  }

  goToPage(pageNumber: number): void {
    if (pageNumber !== this.currentPage) {
      const totalPages = Math.ceil(this.applyFilters().length / this.itemsPerPage);
      if (pageNumber > totalPages) {
        // Double the page number if it exceeds the total number of pages
        this.currentPage = Math.min(pageNumber * 2, totalPages);
      } else {
        this.currentPage = pageNumber;
      }
    }
  }


  // Rest of the code remains the same

  renderItem(item: { [x: string]: unknown } | null) {
    if (typeof item === 'string' || typeof item === 'number') {
      return item;
    } else if (typeof item === 'object' && item !== null) {
      // Handle rendering of object properties
      if (this.dataFormatter) {
        return html`<span>${this.dataFormatter(item)}</span>`;
      } else {
        return html`<span>${JSON.stringify(item)}</span>`;
      }
    } else {
      return '';
    }
  }
  changeSort(event: Event): void {
    const sortColumn = (event.target as HTMLSelectElement).value;
    this.sortColumn = sortColumn;
    this.requestUpdate();
  }

  changeSortDirection(event: Event): void {
    const sortDirection = (event.target as HTMLSelectElement).value;
    this.sortDirection = sortDirection;
    this.requestUpdate();
  }
  getLayoutClass(): string {
    // Determine and return the layout class based on your logic
    // For example, return "material" for Material layout, "basic" for Basic layout, etc.
    return 'material'; // Replace with your logic
  }
  applyFilters(): any[] {
    const { data, searchKeyword } = this;
    if (searchKeyword) {
      // Filter the data based on the search keyword
      const filteredData = data.filter((item) => {
        if (typeof item === 'string') {
          return item.toLowerCase().includes(searchKeyword.toLowerCase());
        } else if (typeof item === 'object' && item !== null) {
          // Handle object properties for filtering
          const propertyValues = Object.values(item);
          return propertyValues.some((value) =>
            String(value).toLowerCase().includes(searchKeyword.toLowerCase())
          );
        }
        // Ignore other data types
        return false;
      });
      return filteredData;
    }
    // If no search keyword is provided, return the original data
    return data;
  }


  applySorting(data: any[]): any[] {
    const { sortColumn, sortDirection } = this;

    // Clone the array to avoid mutating the original data
    const sortedData = [...data];

    // Implement your sorting logic here based on sortColumn and sortDirection
    if (sortColumn && sortDirection) {
      sortedData.sort((a, b) => {
        const valueA = a[sortColumn];
        const valueB = b[sortColumn];

        if (typeof valueA === 'string' && typeof valueB === 'string') {
          // Sort strings alphabetically
          return sortDirection === 'asc'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        // Sort numbers
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      });
    }

    return sortedData;
  }

  applyPagination(data: any[]): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    // Implement your pagination logic here based on startIndex and endIndex
    // Return the paginated subset of the dataset
    return data.slice(startIndex, endIndex);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
    }
  }

  nextPage(): void {
    const maxPage = Math.ceil(this.data.length / this.itemsPerPage);
    if (this.currentPage < maxPage) {
      this.currentPage += 1;
    }
  }

  changePage(event: Event): void {
    const page = parseInt((event.target as HTMLInputElement).value);
    if (!isNaN(page) && page >= 1) {
      const maxPage = Math.ceil(this.data.length / this.itemsPerPage);
      this.currentPage = Math.min(page, maxPage);
    }
  }

  changeItemsPerPage(event: Event): void {
    const itemsPerPage = parseInt((event.target as HTMLSelectElement).value);
    if (!isNaN(itemsPerPage) && itemsPerPage >= 1) {
      this.itemsPerPage = itemsPerPage;
      this.currentPage = 1;
    }
  }

  search(event: Event): void {
    const keyword = (event.target as HTMLInputElement).value;
    this.searchKeyword = keyword;
    this.currentPage = 1; // Reset the current page when performing a new search
    this.requestUpdate(); // Request an update to re-render the component
  }
}

