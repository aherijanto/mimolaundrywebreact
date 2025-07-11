-- CreateTable
CREATE TABLE "Machine" (
    "id" SERIAL NOT NULL,
    "code_machine" TEXT NOT NULL,
    "name_machine" TEXT NOT NULL,
    "brand_machine" TEXT NOT NULL,
    "model_machine" TEXT NOT NULL,
    "year_machine" TEXT NOT NULL,
    "status_machine" TEXT NOT NULL,

    CONSTRAINT "Machine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Machine_Running" (
    "id" SERIAL NOT NULL,
    "code_machine" TEXT NOT NULL,
    "running_machine" BOOLEAN NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Machine_Running_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trans_Laundry" (
    "id" SERIAL NOT NULL,
    "no_trans" TEXT NOT NULL,
    "code_machine" TEXT NOT NULL,
    "request_by" TEXT NOT NULL,
    "date_trans" TIMESTAMP(3) NOT NULL,
    "payment_status" BOOLEAN NOT NULL,

    CONSTRAINT "Trans_Laundry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "no_trans" TEXT NOT NULL,
    "datetime_trans" TIMESTAMP(3) NOT NULL,
    "amount_trans" DOUBLE PRECISION NOT NULL,
    "payment_method" TEXT NOT NULL,
    "payment_status" BOOLEAN NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);
